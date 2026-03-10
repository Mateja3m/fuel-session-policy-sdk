import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import {
  createSessionPolicy,
  executeWithSession,
  type SessionPolicy
} from '@idoa/fuel-session-policy-sdk';
import {
  FuelWalletConnector,
  FueletWalletConnector
} from '@fuels/connectors';
import { evaluateDemoAction } from './demo-policy-helpers.js';

interface FuelWindow {
  fuel?: FuelProvider;
  fuelet?: FuelProvider;
}

interface FuelProvider {
  connect?: () => Promise<boolean>;
  isConnected?: () => Promise<boolean>;
  currentAccount?: () => Promise<string | null>;
  accounts?: () => Promise<string[]>;
  getWallets?: () => Promise<Array<{ address: string | { toString: () => string } }>>;
}

interface ConnectorLike {
  connect: () => Promise<boolean>;
  ping: () => Promise<boolean>;
  currentAccount: () => Promise<string | null>;
  accounts: () => Promise<string[]>;
}

type StatusTone = 'info' | 'success' | 'warning' | 'error';

interface StatusItem {
  tone: StatusTone;
  message: string;
}

const fuelWindow = window as Window & FuelWindow;

const allowedContract = import.meta.env.VITE_ALLOWED_CONTRACT ??
  `0x${'1'.repeat(64)}`;
const blockedContract = import.meta.env.VITE_BLOCKED_CONTRACT ??
  `0x${'2'.repeat(64)}`;

function explainAllowedAction(policy: SessionPolicy | null): string[] {
  if (!policy) {
    return ['No policy loaded yet.'];
  }

  const evaluation = evaluateDemoAction(policy, allowedContract, 1, 0, Date.now());
  return [
    `Contract ${allowedContract} is in allowedContracts.`,
    `Requested spend (1) is <= maxSpend (${policy.maxSpend}).`,
    `Session expires at ${new Date(policy.expiresAt).toISOString()}.`,
    `Result: ${evaluation.reason}`
  ];
}

function explainBlockedAction(policy: SessionPolicy | null): string[] {
  if (!policy) {
    return ['No policy loaded yet.'];
  }

  const evaluation = evaluateDemoAction(policy, blockedContract, 1, 0, Date.now());

  return [
    `Contract ${blockedContract} is not in allowedContracts.`,
    'SDK rejects this action before execution.',
    'This demonstrates predictable blocked-path behavior for reviewers.',
    `Result: ${evaluation.reason}`
  ];
}

async function resolveInjectedProvider(timeoutMs = 2500): Promise<FuelProvider | null> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (fuelWindow.fuel) {
      return fuelWindow.fuel;
    }

    if (fuelWindow.fuelet) {
      return fuelWindow.fuelet;
    }

    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  return null;
}

export function App() {
  const [walletStatus, setWalletStatus] = useState('Disconnected');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [sessionPolicy, setSessionPolicy] = useState<SessionPolicy | null>(null);
  const [sessionApproved, setSessionApproved] = useState(false);
  const [currentSpent, setCurrentSpent] = useState('0');
  const [logs, setLogs] = useState<string[]>([]);
  const [statusItems, setStatusItems] = useState<StatusItem[]>([
    {
      tone: 'info',
      message: 'Ready. Create and approve a short-lived session policy to run demo actions.'
    }
  ]);

  const network = import.meta.env.VITE_FUEL_NETWORK ?? 'local';

  const policyPreview = useMemo(() => {
    if (!sessionPolicy) {
      return 'No policy generated yet.';
    }

    return JSON.stringify({
      ...sessionPolicy,
      expiresAtIso: new Date(sessionPolicy.expiresAt).toISOString(),
      demoIntent: 'Short-lived policy for low-risk demo/testing only.'
    }, null, 2);
  }, [sessionPolicy]);

  function appendLog(message: string): void {
    setLogs((prev) => [`${new Date().toISOString()} ${message}`, ...prev].slice(0, 20));
  }

  function pushStatus(tone: StatusTone, message: string): void {
    setStatusItems((prev) => [{ tone, message }, ...prev].slice(0, 6));
  }

  async function connectWallet(): Promise<void> {
    try {
      const fuel = await resolveInjectedProvider();
      if (!fuel) {
        const connectors: Array<{ connector: ConnectorLike; label: string }> = [
          { connector: new FuelWalletConnector(), label: 'FuelWalletConnector' },
          { connector: new FueletWalletConnector(), label: 'FueletWalletConnector' }
        ];
        const connectorErrors: string[] = [];

        for (const item of connectors) {
          try {
            const pingValue = await item.connector.ping();
            appendLog(`${item.label} ping=${String(pingValue)}.`);

            const connected = await item.connector.connect();
            if (!connected) {
              connectorErrors.push(`${item.label}: connection request rejected.`);
              continue;
            }

            let connectorAddress = await item.connector.currentAccount();
            if (!connectorAddress) {
              const accounts = await item.connector.accounts();
              connectorAddress = accounts[0] ?? null;
            }

            if (!connectorAddress) {
              connectorErrors.push(`${item.label}: connected but no account returned.`);
              continue;
            }

            setWalletAddress(connectorAddress);
            setWalletStatus('Connected');
            appendLog(`Wallet connected via ${item.label}: ${connectorAddress}`);
            pushStatus('success', `Wallet connected via ${item.label}.`);
            return;
          } catch (error) {
            connectorErrors.push(`${item.label}: ${String(error)}`);
            continue;
          }
        }

        if (connectorErrors.length > 0) {
          appendLog(`Connector fallback failed: ${connectorErrors.join(' | ')}`);
        }

        const hasFuel = typeof fuelWindow.fuel !== 'undefined';
        const hasFuelet = typeof fuelWindow.fuelet !== 'undefined';
        setWalletStatus('Fuel wallet provider not detected');
        appendLog(`Wallet connection failed: provider not available. window.fuel=${String(hasFuel)} window.fuelet=${String(hasFuelet)}`);
        pushStatus(
          'warning',
          'Wallet provider not injected. Check extension site access for localhost and disable strict browser shields.'
        );
        return;
      }

      const availableMethods = Object.keys(fuel).sort().join(', ');
      appendLog(`Fuel provider detected with methods: ${availableMethods || 'none'}`);

      if (fuel.connect) {
        const connected = await fuel.connect();
        if (!connected) {
          setWalletStatus('Connection rejected');
          pushStatus('warning', 'Wallet connection request was rejected.');
          return;
        }
      }

      let address: string | null = null;

      if (fuel.currentAccount) {
        address = await fuel.currentAccount();
      }

      if (!address && fuel.accounts) {
        const accounts = await fuel.accounts();
        address = accounts[0] ?? null;
      }

      if (!address && fuel.getWallets) {
        const wallets = await fuel.getWallets();
        const first = wallets[0];
        address = typeof first?.address === 'string'
          ? first.address
          : first?.address?.toString() ?? null;
      }

      if (!address) {
        setWalletStatus('No wallet available');
        appendLog('No account returned by provider after connect/currentAccount/accounts checks.');
        pushStatus('warning', 'Wallet detected, but no authorized account is available for this dApp.');
        return;
      }

      setWalletAddress(address);
      setWalletStatus('Connected');
      appendLog(`Wallet connected: ${address}`);
      pushStatus('success', 'Wallet connected. You can now generate and approve a session policy.');
    } catch (error) {
      setWalletStatus('Connection error');
      appendLog(`Wallet connection error: ${String(error)}`);
      pushStatus('error', `Wallet connection error: ${String(error)}`);
    }
  }

  function generatePolicy(): void {
    try {
      const policy = createSessionPolicy({
        expiresAt: Date.now() + 5 * 60 * 1000,
        maxSpend: '5',
        allowedContracts: [allowedContract],
        allowedAssets: [],
        allowedActions: []
      });

      setSessionPolicy(policy);
      setSessionApproved(false);
      setCurrentSpent('0');
      appendLog('Session policy generated.');
      pushStatus('info', 'Short-lived session policy generated (5 minutes, maxSpend 5, 1 allowed contract).');
    } catch (error) {
      appendLog(`Failed to generate policy: ${String(error)}`);
      pushStatus('error', `Policy generation failed: ${String(error)}`);
    }
  }

  function approveSession(): void {
    if (!sessionPolicy) {
      appendLog('Cannot approve session: generate a policy first.');
      pushStatus('warning', 'Generate a policy before approving a session.');
      return;
    }

    setSessionApproved(true);
    appendLog('Session approved by user.');
    pushStatus('success', 'Session approved. Valid actions can be executed until policy constraints are reached.');
  }

  async function executeAction(targetContract: string): Promise<void> {
    if (!sessionPolicy || !sessionApproved) {
      appendLog('Cannot execute: session policy is not approved.');
      pushStatus('warning', 'Execution blocked because session is not approved yet.');
      return;
    }

    try {
      const result = await executeWithSession({
        policy: sessionPolicy,
        targetContract,
        amount: '1',
        currentSpent,
        executor: async () => ({
          txId: `mock-${Math.random().toString(16).slice(2)}`,
          targetContract
        })
      });

      setCurrentSpent(result.nextSpent);
      appendLog(`Execution success for ${targetContract}. txId=${result.receipt.txId}`);
      pushStatus('success', `Valid action executed. Spend moved from ${currentSpent} to ${result.nextSpent}.`);
    } catch (error) {
      appendLog(`Execution blocked for ${targetContract}: ${String(error)}`);
      pushStatus('error', `Execution blocked as expected: ${String(error)}`);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={700}>
            Fuel Session Policy SDK Demo
          </Typography>

          <Stack direction="row" spacing={1}>
            <Chip label={`Network: ${network}`} color="primary" />
            <Chip label={`Wallet: ${walletStatus}`} color={walletStatus === 'Connected' ? 'success' : 'default'} />
          </Stack>

          {walletAddress ? <Alert severity="info">Connected address: {walletAddress}</Alert> : null}

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="outlined" onClick={connectWallet}>Connect Wallet</Button>
            <Button variant="contained" onClick={generatePolicy}>Create Example Session Policy</Button>
            <Button variant="contained" color="success" onClick={approveSession}>Approve Session</Button>
          </Stack>

          <Divider />

          <Box>
            <Typography variant="h6">Generated Session Policy Preview</Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#fbfcfd' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{policyPreview}</pre>
            </Paper>
          </Box>

          <Box>
            <Typography variant="h6">Why Valid Action Is Allowed</Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
              <Stack spacing={1}>
                {explainAllowedAction(sessionPolicy).map((line) => (
                  <Typography key={line} variant="body2">{line}</Typography>
                ))}
              </Stack>
            </Paper>
          </Box>

          <Box>
            <Typography variant="h6">Why Invalid Action Is Blocked</Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
              <Stack spacing={1}>
                {explainBlockedAction(sessionPolicy).map((line) => (
                  <Typography key={line} variant="body2">{line}</Typography>
                ))}
              </Stack>
            </Paper>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="contained"
              onClick={() => executeAction(allowedContract)}
              disabled={!sessionApproved}
            >
              Execute Valid Action
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => executeAction(blockedContract)}
              disabled={!sessionApproved}
            >
              Execute Invalid Action
            </Button>
          </Stack>

          <Typography variant="body2">Current session spend: {currentSpent}</Typography>

          <Box>
            <Typography variant="h6">Result / Status Panel</Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {statusItems.map((status) => (
                <Alert key={`${status.message}-${status.tone}`} severity={status.tone}>{status.message}</Alert>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="h6">Result Logs</Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1, maxHeight: 240, overflowY: 'auto' }}>
              {logs.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No logs yet.</Typography>
              ) : (
                <Stack spacing={1}>
                  {logs.map((entry) => (
                    <Typography key={entry} variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {entry}
                    </Typography>
                  ))}
                </Stack>
              )}
            </Paper>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
