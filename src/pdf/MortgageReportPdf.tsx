import type React from 'react';

import {
  Document,
  type DocumentProps,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

import {
  formatCurrency,
  formatInteger,
  formatMonthYear,
  formatPercent,
} from '../lib/format';
import type { MortgageInputs, MortgageSummary } from '../lib/mortgage';
import type { LoanYearGroup } from '../hooks/useLoanYearGroups';

export type MortgageReportPdfData = {
  generatedAtIso: string;
  inputs: MortgageInputs;
  summary: MortgageSummary;
  loanYearGroups: LoanYearGroup[];
  monthlyTaxesCosts: number;
  totalMonthlyPayment: number;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 24,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#0f172a',
  },
  title: { fontSize: 18, fontWeight: 700 },
  subtitle: { marginTop: 4, fontSize: 10, color: '#334155' },
  section: { marginTop: 14 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  col: { flexGrow: 1 },
  right: { textAlign: 'right' },

  cards: { flexDirection: 'row', gap: 8 },
  card: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
  },
  cardLabel: { fontSize: 9, color: '#475569', fontWeight: 700 },
  cardValue: { marginTop: 2, fontSize: 14, fontWeight: 800 },
  cardSub: { marginTop: 2, fontSize: 8, color: '#475569' },

  table: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  th: { fontSize: 8, fontWeight: 700, color: '#334155' },
  tbody: { paddingHorizontal: 8 },
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 5,
  },
  td: { fontSize: 8, color: '#0f172a' },
  tfoot: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 8 },
  footLabel: { fontSize: 8, fontWeight: 800 },
  footValue: { fontSize: 8, fontWeight: 800, textAlign: 'right' },

  groupHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  groupTitle: { fontSize: 11, fontWeight: 800 },
  groupRange: { marginTop: 2, fontSize: 8, color: '#475569' },
  note: { marginTop: 12, fontSize: 8, color: '#64748b' },
});

const colStyles = {
  month: { width: '16%' },
  total: { width: '12%' },
  pi: { width: '11%' },
  extra: { width: '10%' },
  taxes: { width: '10%' },
  interest: { width: '11%' },
  principal: { width: '12%' },
  balance: { width: '18%' },
} as const;

function MoneyCell(props: { value: number }) {
  return (
    <Text style={[styles.td, styles.right]}>{formatCurrency(props.value)}</Text>
  );
}

export function MortgageReportPdfDocument(
  props: MortgageReportPdfData,
): React.ReactElement<DocumentProps> {
  const {
    generatedAtIso,
    inputs,
    summary,
    loanYearGroups,
    monthlyTaxesCosts,
    totalMonthlyPayment,
  } = props;

  const generatedDate = new Date(generatedAtIso).toLocaleDateString();
  const startLabel = formatMonthYear(inputs.startMonthIndex0, inputs.startYear);
  const payoffText = formatMonthYear(
    summary.payoffMonthIndex0,
    summary.payoffYear,
  );

  const payoffDurationYears = Math.floor(summary.monthsToPayoff / 12);
  const payoffDurationMonths = summary.monthsToPayoff % 12;

  return (
    <Document title="Mortgage report">
      <Page size="LETTER" style={styles.page}>
        <View>
          <Text style={styles.title}>Mortgage Summary</Text>
          <Text style={styles.subtitle}>
            Generated {generatedDate} • Start {startLabel}
          </Text>
        </View>

        <View style={[styles.section, styles.row]}>
          <View style={styles.col}>
            <Text style={{ fontSize: 10, fontWeight: 700 }}>Inputs</Text>
            <Text style={{ marginTop: 4, fontSize: 9, color: '#334155' }}>
              Home price: {formatCurrency(summary.homePrice)}
            </Text>
            <Text style={{ fontSize: 9, color: '#334155' }}>
              Down: {formatCurrency(summary.downPaymentAmount)} (
              {formatPercent(summary.downPaymentPercent, 2)})
            </Text>
            <Text style={{ fontSize: 9, color: '#334155' }}>
              Rate: {formatPercent(summary.annualRatePercent, 3)} • Term:{' '}
              {formatInteger(summary.termMonths)} mo
            </Text>
          </View>
          <View style={[styles.col, { alignItems: 'flex-end' }]}>
            <Text style={{ fontSize: 10, fontWeight: 700 }}>Key</Text>
            <Text style={{ marginTop: 4, fontSize: 9, color: '#334155' }}>
              Payoff: {payoffText}
            </Text>
            <Text style={{ fontSize: 9, color: '#334155' }}>
              Duration: {formatInteger(payoffDurationYears)}y{' '}
              {formatInteger(payoffDurationMonths)}m
            </Text>
          </View>
        </View>

        <View style={[styles.section, styles.cards]}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>MONTHLY</Text>
            <Text style={styles.cardValue}>
              {formatCurrency(totalMonthlyPayment)}
            </Text>
            <Text style={styles.cardSub}>
              {formatCurrency(summary.scheduledMonthlyPI)} P&I
              {inputs.includeTaxesCosts
                ? ` + ${formatCurrency(summary.monthlyTaxesCosts)} taxes/costs`
                : ''}
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>PAYOFF</Text>
            <Text style={styles.cardValue}>{payoffText}</Text>
            <Text style={styles.cardSub}>
              {formatInteger(payoffDurationYears)}y{' '}
              {formatInteger(payoffDurationMonths)}m
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>SAVINGS</Text>
            <Text style={styles.cardValue}>
              {formatCurrency(summary.interestSaved)}
            </Text>
            <Text style={styles.cardSub}>
              {formatInteger(summary.monthsSaved)} months sooner
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: '60%' }]}>Totals</Text>
              <Text style={[styles.th, styles.right, { width: '40%' }]}>
                Amount
              </Text>
            </View>
            <View style={[styles.tbody, { paddingVertical: 6 }]}>
              <View
                style={[
                  styles.row,
                  { justifyContent: 'space-between', marginBottom: 4 },
                ]}
              >
                <Text style={{ fontSize: 9, color: '#334155' }}>
                  Total to lender
                </Text>
                <Text style={{ fontSize: 9, fontWeight: 700 }}>
                  {formatCurrency(summary.totalToLender)}
                </Text>
              </View>
              <View
                style={[
                  styles.row,
                  { justifyContent: 'space-between', marginBottom: 4 },
                ]}
              >
                <Text style={{ fontSize: 9, color: '#334155' }}>
                  Total interest
                </Text>
                <Text style={{ fontSize: 9, fontWeight: 700 }}>
                  {formatCurrency(summary.totalInterest)}
                </Text>
              </View>
              {inputs.includeTaxesCosts ? (
                <View
                  style={[
                    styles.row,
                    { justifyContent: 'space-between', marginBottom: 4 },
                  ]}
                >
                  <Text style={{ fontSize: 9, color: '#334155' }}>
                    Taxes & costs
                  </Text>
                  <Text style={{ fontSize: 9, fontWeight: 700 }}>
                    {formatCurrency(summary.totalTaxesCosts)}
                  </Text>
                </View>
              ) : null}
              <View
                style={[
                  styles.row,
                  { justifyContent: 'space-between', marginTop: 6 },
                ]}
              >
                <Text style={{ fontSize: 9, fontWeight: 800 }}>
                  Total out-of-pocket
                </Text>
                <Text style={{ fontSize: 9, fontWeight: 800 }}>
                  {formatCurrency(summary.totalOutOfPocket)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 11, fontWeight: 800 }}>
            Schedule by loan year
          </Text>
          {loanYearGroups.length ? (
            loanYearGroups.map((g, idx) => (
              <View
                key={g.loanYear}
                break={idx !== 0}
                style={{ marginTop: 10 }}
              >
                <View style={styles.groupHeader}>
                  <View>
                    <Text style={styles.groupTitle}>Year {g.loanYear}</Text>
                    <Text style={styles.groupRange}>
                      {g.startLabel} – {g.endLabel}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.groupRange, styles.right]}>
                      Total: {formatCurrency(g.totals.totalPayment)}
                    </Text>
                    <Text style={[styles.groupRange, styles.right]}>
                      Interest: {formatCurrency(g.totals.interest)}
                    </Text>
                  </View>
                </View>

                <View style={[styles.table, { marginTop: 6 }]}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.th, colStyles.month]}>Month</Text>
                    <Text style={[styles.th, styles.right, colStyles.total]}>
                      Total
                    </Text>
                    <Text style={[styles.th, styles.right, colStyles.pi]}>
                      P&I
                    </Text>
                    <Text style={[styles.th, styles.right, colStyles.extra]}>
                      Extra
                    </Text>
                    <Text style={[styles.th, styles.right, colStyles.taxes]}>
                      Taxes
                    </Text>
                    <Text style={[styles.th, styles.right, colStyles.interest]}>
                      Interest
                    </Text>
                    <Text
                      style={[styles.th, styles.right, colStyles.principal]}
                    >
                      Principal
                    </Text>
                    <Text style={[styles.th, styles.right, colStyles.balance]}>
                      Balance
                    </Text>
                  </View>

                  <View style={styles.tbody}>
                    {g.rows.map((r) => (
                      <View key={r.index} style={styles.tr}>
                        <Text style={[styles.td, colStyles.month]}>
                          {formatMonthYear(r.monthIndex0, r.year)}
                        </Text>
                        <View style={colStyles.total}>
                          <MoneyCell
                            value={r.totalToLender + monthlyTaxesCosts}
                          />
                        </View>
                        <View style={colStyles.pi}>
                          <MoneyCell value={r.paymentPI} />
                        </View>
                        <View style={colStyles.extra}>
                          <MoneyCell value={r.extraPrincipal} />
                        </View>
                        <View style={colStyles.taxes}>
                          <Text style={[styles.td, styles.right]}>
                            {monthlyTaxesCosts
                              ? formatCurrency(monthlyTaxesCosts)
                              : '—'}
                          </Text>
                        </View>
                        <View style={colStyles.interest}>
                          <MoneyCell value={r.interest} />
                        </View>
                        <View style={colStyles.principal}>
                          <MoneyCell value={r.principal + r.extraPrincipal} />
                        </View>
                        <View style={colStyles.balance}>
                          <MoneyCell value={r.balance} />
                        </View>
                      </View>
                    ))}
                  </View>

                  <View style={styles.tfoot}>
                    <Text style={[styles.footLabel, colStyles.month]}>
                      Total
                    </Text>
                    <Text style={[styles.footValue, colStyles.total]}>
                      {formatCurrency(g.totals.totalPayment)}
                    </Text>
                    <Text style={[styles.footValue, colStyles.pi]}>
                      {formatCurrency(g.totals.pi)}
                    </Text>
                    <Text style={[styles.footValue, colStyles.extra]}>
                      {formatCurrency(g.totals.extra)}
                    </Text>
                    <Text style={[styles.footValue, colStyles.taxes]}>
                      {g.totals.taxesCosts
                        ? formatCurrency(g.totals.taxesCosts)
                        : '—'}
                    </Text>
                    <Text style={[styles.footValue, colStyles.interest]}>
                      {formatCurrency(g.totals.interest)}
                    </Text>
                    <Text style={[styles.footValue, colStyles.principal]}>
                      {formatCurrency(g.totals.principal)}
                    </Text>
                    <Text style={[styles.footValue, colStyles.balance]}>
                      {formatCurrency(g.endBalance)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ marginTop: 6, fontSize: 9, color: '#64748b' }}>
              Enter values to generate a full schedule.
            </Text>
          )}
        </View>

        <Text style={styles.note}>
          Numbers are estimates for planning and comparison.
        </Text>
      </Page>
    </Document>
  );
}
