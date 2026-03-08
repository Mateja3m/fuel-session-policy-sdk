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
} from '@fuel-session-policy/sdk';

interface FuelWindow {
  fuel?: {
    getWallets?: () => Promise<Array<{ address: string | { toString: () => string } }>>;
  };
}

const fuelWindow = window as Window & FuelWindow;

const allowedContract = import.meta.env.VITE_ALLOWED_CONTRACT ??
  `0x${'1'.repeat(64)}`;
const blockedContract = import.meta.env.VITE_BLOCKED_CONTRACT ??
  `0x${'2'.repeat(64)}`;

export function App() {
  const [walletStatus, setWalletStatus] = useState('Disconnected');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [sessionPolicy, setSessionPolicy] = useState<SessionPolicy | null>(null);
  const [sessionApproved, setSessionApproved] = useState(false);
  const [currentSpent, setCurrentSpent] = useState('0');
  const [logs, setLogs] = useState<string[]>([]);

  const network = import.meta.env.VITE_FUEL_NETWORK ?? 'local';

  const policyPreview = useMemo(() => {
    if (!sessionPolicy) {
      return 'No policy generated yet.';
    }

    return JSON.stringify(sessionPolicy, null, 2);
  }, [sessionPolicy]);

  function appendLog(message: string): void {
    setLogs((prev) => [`${new Date().toISOString()} ${message}`, ...prev].slice(0, 20));
  }

  async function connectWallet(): Promise<void> {
    try {
      if (!fuelWindow.fuel?.getWallets) {
        setWalletStatus('Fuel wallet provider not detected');
        appendLog('Wallet connection failed: Fuel provider not available.');
        return;
      }

      const wallets = await fuelWindow.fuel.getWallets();
      const first = wallets[0];
      const address = typeof first?.address === 'string'
        ? first.address
        : first?.address?.toString();

      if (!address) {
        setWalletStatus('No wallet available');
        appendLog('No wallet returned by provider.');
        return;
      }

      setWalletAddress(address);
      setWalletStatus('Connected');
      appendLog(`Wallet connected: ${address}`);
    } catch (error) {
      setWalletStatus('Connection error');
      appendLog(`Wallet connection error: ${String(error)}`);
    }
  }

  function generatePolicy(): void {
    try {
      const policy = createSessionPolicy({
        expiresAt: Date.now() + 15 * 60 * 1000,
        maxSpend: '5',
        allowedContracts: [allowedContract],
        allowedAssets: [],
        allowedActions: []
      });

      setSessionPolicy(policy);
      setSessionApproved(false);
      setCurrentSpent('0');
      appendLog('Session policy generated.');
    } catch (error) {
      appendLog(`Failed to generate policy: ${String(error)}`);
    }
  }

  function approveSession(): void {
    if (!sessionPolicy) {
      appendLog('Cannot approve session: generate a policy first.');
      return;
    }

    setSessionApproved(true);
    appendLog('Session approved by user.');
  }

  async function executeAction(targetContract: string): Promise<void> {
    if (!sessionPolicy || !sessionApproved) {
      appendLog('Cannot execute: session policy is not approved.');
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
    } catch (error) {
      appendLog(`Execution blocked for ${targetContract}: ${String(error)}`);
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
