import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { ReportData, ReportMetadata } from '../types';

// Styles for the executive report
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #3b82f6',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 5,
  },
  text: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    width: '23%',
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    border: '1 solid #e5e7eb',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 9,
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  findingItem: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#fef2f2',
    borderLeft: '3 solid #ef4444',
    borderRadius: 2,
  },
  findingTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 4,
  },
  findingDescription: {
    fontSize: 10,
    color: '#7f1d1d',
    lineHeight: 1.4,
  },
  severityBadge: {
    fontSize: 8,
    padding: '3 6',
    borderRadius: 3,
    fontWeight: 'bold',
    marginBottom: 5,
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
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 10,
  },
});

interface ExecutiveReportProps {
  data: ReportData;
  metadata: ReportMetadata;
}

export const ExecutiveReport: React.FC<ExecutiveReportProps> = ({
  data,
  metadata,
}) => {
  const criticalFindings = data.findings.filter(
    (f) => f.severity === 'critical'
  );
  const highFindings = data.findings.filter((f) => f.severity === 'high');
  const mediumFindings = data.findings.filter((f) => f.severity === 'medium');
  const lowFindings = data.findings.filter((f) => f.severity === 'low');

  const riskScore = Math.min(
    100,
    criticalFindings.length * 10 +
      highFindings.length * 5 +
      mediumFindings.length * 2 +
      lowFindings.length * 1
  );

  const topFindings = [
    ...criticalFindings.slice(0, 3),
    ...highFindings.slice(0, 5 - criticalFindings.length),
  ].slice(0, 5);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Security Assessment Report</Text>
          <Text style={styles.subtitle}>
            Executive Summary - {data.scan.name}
          </Text>
          <Text style={styles.subtitle}>
            Generated: {new Date(metadata.generated_at).toLocaleString()}
          </Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.text}>
            HeimdallAI conducted a comprehensive security assessment of{' '}
            <Text style={styles.bold}>{data.scan.target}</Text> on{' '}
            {new Date(data.scan.started_at).toLocaleDateString()}. The
            assessment identified{' '}
            <Text style={styles.bold}>
              {data.findings.length} security findings
            </Text>
            , including{' '}
            <Text style={styles.bold}>
              {criticalFindings.length} critical
            </Text>{' '}
            and <Text style={styles.bold}>{highFindings.length} high</Text>{' '}
            severity vulnerabilities that require immediate attention.
          </Text>
          <Text style={styles.text}>
            The overall risk score for this assessment is{' '}
            <Text style={styles.bold}>{riskScore}/100</Text>, indicating a{' '}
            {riskScore > 70
              ? 'high'
              : riskScore > 40
                ? 'medium'
                : 'low'}{' '}
            risk level that requires{' '}
            {riskScore > 70
              ? 'urgent remediation efforts'
              : riskScore > 40
                ? 'timely attention'
                : 'ongoing monitoring'}.
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{criticalFindings.length}</Text>
              <Text style={styles.statLabel}>Critical</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{highFindings.length}</Text>
              <Text style={styles.statLabel}>High</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{mediumFindings.length}</Text>
              <Text style={styles.statLabel}>Medium</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{lowFindings.length}</Text>
              <Text style={styles.statLabel}>Low</Text>
            </View>
          </View>
        </View>

        {/* Top 5 Critical Issues */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Top {topFindings.length} Critical Issues
          </Text>
          {topFindings.map((finding, index) => {
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
              <View key={finding.id} style={styles.findingItem}>
                <View style={[styles.severityBadge, severityStyle]}>
                  <Text>{finding.severity.toUpperCase()}</Text>
                </View>
                <Text style={styles.findingTitle}>
                  {index + 1}. {finding.title}
                </Text>
                <Text style={styles.findingDescription}>
                  {finding.description.substring(0, 150)}
                  {finding.description.length > 150 ? '...' : ''}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Next Steps</Text>
          <Text style={styles.text}>
            1. <Text style={styles.bold}>Immediate Action:</Text> Address all
            critical and high severity findings within 7 days.
          </Text>
          <Text style={styles.text}>
            2. <Text style={styles.bold}>Security Review:</Text> Conduct a
            comprehensive code and configuration review for affected systems.
          </Text>
          <Text style={styles.text}>
            3. <Text style={styles.bold}>Implement Fixes:</Text> Follow the
            detailed remediation guidance provided in the technical report.
          </Text>
          <Text style={styles.text}>
            4. <Text style={styles.bold}>Verification:</Text> Re-scan after
            implementing fixes to verify successful remediation.
          </Text>
          <Text style={styles.text}>
            5. <Text style={styles.bold}>Continuous Monitoring:</Text> Enable
            scheduled scans to detect new vulnerabilities proactively.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Confidential Security Report - {metadata.organization || 'HeimdallAI'}
          </Text>
          <Text>Generated by HeimdallAI - AI-Powered Security Testing Platform</Text>
        </View>
      </Page>
    </Document>
  );
};
