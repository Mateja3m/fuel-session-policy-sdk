export class SessionPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionPolicyError';
  }
}
