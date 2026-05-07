/* 2.3 Alpha (educational sidebar) — research/10 §5-§6.
 * IR_slice = IC · √n_dec  (Grinold 1989 Fundamental Law, NON-DALIO)
 * IR_port  = IR_slice · √N / √[1 + (N−1)·ρ_avg]
 *
 * Per Spec §4.4 FR-4.4: this slide is OFF the live numbered sequence (sidebar only).
 */

const ELIGIBLE_THRESHOLD = 0.30;
const RETIRE_THRESHOLD = 0.15;

export function computeAlpha(input) {
  const { N = 1, ρ_avg = 0, IC = 0, n_dec = 1 } = input;

  const IR_slice = IC * Math.sqrt(n_dec);
  const N_eff = N / (1 + (N - 1) * ρ_avg);
  const IR_port = IR_slice * Math.sqrt(N) / Math.sqrt(1 + (N - 1) * ρ_avg);

  return {
    IR_slice, IR_port, N_eff,
    eligible: IR_slice >= ELIGIBLE_THRESHOLD,
    retire: IR_slice < RETIRE_THRESHOLD,
    emits: ['IR_port', 'σ_Alpha', 'N_eff']
  };
}
