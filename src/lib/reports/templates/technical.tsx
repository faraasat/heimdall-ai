import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { ReportData, ReportMetadata } from '../types';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #3b82f6',
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
    padding: 5,
  },
  subsectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
    marginTop: 5,
  },
  text: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#374151',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  code: {
    fontFamily: 'Courier',
    fontSize: 8,
    backgroundColor: '#f9fafb',
    padding: 5,
    marginBottom: 5,
    borderRadius: 2,
  },
  findingBlock: {
    marginBottom: 15,
    padding: 10,
    border: '1 solid #d1d5db',
    borderRadius: 3,
  },
  findingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  findingTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  severityBadge: {
    fontSize: 8,
    padding: '2 5',
    borderRadius: 3,
    fontWeight: 'bold',
  },
  critical: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  high: {
    backgroundColor: '#ffedd5',
    color: '#9a3412',
  },
  medium: {
    backgroundColor: '#fef9c3',
    color: '#854d0e',
  },
  low: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  table: {
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
    paddingVertical: 4,
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 8,
    padding: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 7,
    color: '#9ca3af',
    textAlign: 'center',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 8,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 20,
    right: 30,
    color: '#6b7280',
  },
});

interface TechnicalReportProps {
  data: ReportData;
  metadata: ReportMetadata;
}

export const TechnicalReport: React.FC<TechnicalReportProps> = ({
  data,
  metadata,
}) => {
  const groupedFindings = {
    critical: data.findings.filter((f) => f.severity === 'critical'),
    high: data.findings.filter((f) => f.severity === 'high'),
    medium: data.findings.filter((f) => f.severity === 'medium'),
    low: data.findings.filter((f) => f.severity === 'low'),
    info: data.findings.filter((f) => f.severity === 'info'),
  };

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Technical Security Assessment Report</Text>
          <Text style={styles.subtitle}>{data.scan.name}</Text>
          <Text style={styles.subtitle}>Target: {data.scan.target}</Text>
          <Text style={styles.subtitle}>
            Generated: {new Date(metadata.generated_at).toLocaleString()}
          </Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Executive Summary</Text>
          <Text style={styles.text}>
            This technical report provides a comprehensive analysis of the
            security assessment conducted on {data.scan.target}. The assessment
            was performed using HeimdallAI's AI-powered autonomous penetration
            testing platform on{' '}
            {new Date(data.scan.started_at).toLocaleDateString()}.
          </Text>
          <Text style={styles.text}>
            Assessment Duration: {Math.floor(data.scan.duration_seconds / 60)}{' '}
            minutes
          </Text>
          <Text style={styles.text}>
            Total Findings: {data.findings.length}
          </Text>
        </View>

        {/* Scope */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Scope & Methodology</Text>
          <Text style={styles.subsectionTitle}>Testing Scope:</Text>
          <Text style={styles.text}>Target: {data.scan.target}</Text>
          <Text style={styles.text}>
            Testing Types: {data.scan.scan_types?.join(', ') || 'N/A'}
          </Text>
          <Text style={styles.subsectionTitle}>Methodology:</Text>
          <Text style={styles.text}>
            The assessment employed AI-powered agents specializing in different
            security domains. Each agent performed automated testing while the
            AI analyzed findings for exploitability and risk.
          </Text>
        </View>

        {/* Findings Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Findings Summary</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { width: '50%' }]}>Severity</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>Count</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>Percentage</Text>
            </View>
            {Object.entries(groupedFindings).map(([severity, findings]) => (
              <View key={severity} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '50%' }]}>
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>
                  {findings.length}
                </Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>
                  {((findings.length / data.findings.length) * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Confidential - Page 1</Text>
        </View>
      </Page>

      {/* Detailed Findings Pages */}
      {Object.entries(groupedFindings).map(
        ([severity, findings]) =>
          findings.length > 0 && (
            <Page key={severity} size="A4" style={styles.page}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {severity.toUpperCase()} Severity Findings (
                  {findings.length})
                </Text>

                {findings.map((finding, index) => {
                  const severityStyle = finding.severity === 'critical'
                    ? styles.critical
                    : finding.severity === 'high'
                      ? styles.high
                      : finding.severity === 'medium'
                        ? styles.medium
                        : finding.severity === 'low'
                          ? styles.low
                          : styles.critical;

                  return (
                    <View key={finding.id} style={styles.findingBlock}>
                      <View style={styles.findingHeader}>
                        <Text style={styles.findingTitle}>
                          {severity.charAt(0).toUpperCase() + severity.slice(1)}-
                          {index + 1}: {finding.title}
                        </Text>
                        <View style={[styles.severityBadge, severityStyle]}>
                          <Text>{severity.toUpperCase()}</Text>
                        </View>
                      </View>

                    <Text style={styles.subsectionTitle}>Description:</Text>
                    <Text style={styles.text}>{finding.description}</Text>

                    <Text style={styles.subsectionTitle}>Affected Asset:</Text>
                    <Text style={styles.text}>{finding.affected_asset}</Text>

                    {finding.cvss_score && (
                      <>
                        <Text style={styles.subsectionTitle}>CVSS Score:</Text>
                        <Text style={styles.text}>
                          {finding.cvss_score}/10.0
                        </Text>
                      </>
                    )}

                    {finding.cwe_id && (
                      <>
                        <Text style={styles.subsectionTitle}>CWE ID:</Text>
                        <Text style={styles.text}>{finding.cwe_id}</Text>
                      </>
                    )}

                    {finding.ai_reasoning?.confidence && (
                      <>
                        <Text style={styles.subsectionTitle}>
                          AI Confidence:
                        </Text>
                        <Text style={styles.text}>
                          {(finding.ai_reasoning.confidence).toFixed(0)}%
                        </Text>
                      </>
                    )}

                    {finding.remediation?.steps && (
                      <>
                        <Text style={styles.subsectionTitle}>
                          Remediation Steps:
                        </Text>
                        {finding.remediation.steps.map(
                          (step: string, idx: number) => (
                            <Text key={idx} style={styles.text}>
                              {idx + 1}. {step}
                            </Text>
                          )
                        )}
                      </>
                    )}

                    <Text style={styles.subsectionTitle}>
                      Discovered By:
                    </Text>
                    <Text style={styles.text}>
                      {finding.discovered_by_agent}
                    </Text>
                  </View>
                );
              })}
              </View>

              <View style={styles.footer}>
                <Text>Confidential Security Report</Text>
              </View>
            </Page>
          )
      )}

      {/* Conclusion Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conclusion & Recommendations</Text>
          <Text style={styles.text}>
            Based on the findings identified in this assessment, we recommend
            the following actions:
          </Text>
          <Text style={styles.text}>
            1. <Text style={styles.bold}>Immediate Priority:</Text> Address all
            critical findings within 48 hours.
          </Text>
          <Text style={styles.text}>
            2. <Text style={styles.bold}>High Priority:</Text> Remediate high
            severity findings within 7 days.
          </Text>
          <Text style={styles.text}>
            3. <Text style={styles.bold}>Medium Priority:</Text> Plan
            remediation for medium severity findings within 30 days.
          </Text>
          <Text style={styles.text}>
            4. <Text style={styles.bold}>Validation:</Text> After implementing
            fixes, conduct a follow-up scan to verify remediation.
          </Text>
          <Text style={styles.text}>
            5. <Text style={styles.bold}>Continuous Security:</Text> Implement
            scheduled recurring scans to maintain security posture.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.text}>
            For questions about this report or assistance with remediation,
            please contact the HeimdallAI security team.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>
            End of Report - Generated by HeimdallAI Security Platform
          </Text>
        </View>
      </Page>
    </Document>
  );
};
