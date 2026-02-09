/**
 * Demo/Example file for Explainable AI (XAI) Module
 * 
 * This file demonstrates how to use the algorithmic XAI implementations
 * without requiring any LLM or external service dependencies.
 */

import {
  analyzeSHAP,
  explainWithLIME,
  generateCounterfactual,
  extractAnchors,
  analyzePartialDependence,
  calculateIntegratedGradients,
  comprehensiveXAIAnalysis,
  type SHAPAnalysis,
  type LIMEExplanation,
  type CounterfactualScenario,
  type AnchorRule,
  type PDPAnalysis,
  type IntegratedGradient,
} from './explainable-ai'

// Example finding data
const exampleFinding = {
  title: 'SQL Injection Vulnerability in Login Form',
  description: 'The login form does not properly sanitize user input, allowing SQL injection attacks through the username parameter. Attackers can bypass authentication and access sensitive database information.',
  evidence: {
    endpoint: '/api/login',
    parameter: 'username',
    payload: "' OR '1'='1",
    response_code: 200,
    authentication_bypassed: true,
    database_accessed: true,
  },
  severity: 'critical',
  affected_asset: 'https://example.com/api/login',
}

/**
 * Example 1: SHAP Analysis - Feature Importance
 * Shows which security features contribute most to the vulnerability detection
 */
export async function demoSHAP() {
  console.log('=== SHAP Analysis Demo ===\n')
  
  const shapResults: SHAPAnalysis = await analyzeSHAP(exampleFinding)
  
  console.log('Base Risk Score:', shapResults.base_risk_score)
  console.log('Final Risk Score:', shapResults.final_risk_score)
  console.log('\nTop Contributing Features:')
  
  shapResults.feature_impacts.slice(0, 5).forEach((impact, idx) => {
    console.log(`${idx + 1}. ${impact.feature}`)
    console.log(`   Importance: ${impact.importance.toFixed(3)}`)
    console.log(`   Contribution: ${impact.contribution}`)
    console.log(`   ${impact.explanation}\n`)
  })
  
  return shapResults
}

/**
 * Example 2: LIME Explanation - Local Interpretable Model
 * Provides local explanation for this specific finding
 */
export async function demoLIME() {
  console.log('=== LIME Analysis Demo ===\n')
  
  const limeResults: LIMEExplanation = await explainWithLIME(exampleFinding)
  
  console.log('Prediction:', limeResults.prediction)
  console.log('Confidence:', (limeResults.confidence * 100).toFixed(1) + '%')
  console.log('\nLocal Factors:')
  
  limeResults.local_factors.forEach((factor, idx) => {
    console.log(`${idx + 1}. ${factor.factor}`)
    console.log(`   Weight: ${factor.weight.toFixed(3)}`)
    console.log(`   Direction: ${factor.direction}`)
    console.log(`   ${factor.example}\n`)
  })
  
  console.log('Decision Boundary:', limeResults.decision_boundary)
  
  return limeResults
}

/**
 * Example 3: Counterfactual Analysis - What-If Scenarios
 * Shows minimal changes needed to prevent the vulnerability
 */
export async function demoCounterfactual() {
  console.log('=== Counterfactual Analysis Demo ===\n')
  
  const cfResults: CounterfactualScenario = await generateCounterfactual(exampleFinding)
  
  console.log('Original State:')
  console.log(`  Vulnerability: ${cfResults.original_state.vulnerability}`)
  console.log(`  Severity: ${cfResults.original_state.severity}`)
  console.log(`  Exploitability: ${cfResults.original_state.exploitability}`)
  
  console.log('\nCounterfactual State:')
  console.log(`  New Severity: ${cfResults.counterfactual_state.new_severity}`)
  console.log(`  New Exploitability: ${cfResults.counterfactual_state.new_exploitability}`)
  
  console.log('\nMinimal Changes Required:')
  cfResults.minimal_changes_required.forEach((change, idx) => {
    console.log(`  ${idx + 1}. ${change}`)
  })
  
  console.log(`\nFeasibility Score: ${(cfResults.feasibility_score * 100).toFixed(0)}%`)
  console.log(`Estimated Effort: ${cfResults.estimated_effort}`)
  
  return cfResults
}

/**
 * Example 4: Anchor Rules - High-Precision Conditions
 * Extracts rules that reliably predict this type of vulnerability
 */
export async function demoAnchors() {
  console.log('=== Anchor Rules Demo ===\n')
  
  const anchors: AnchorRule[] = await extractAnchors(exampleFinding)
  
  anchors.forEach((anchor, idx) => {
    console.log(`Anchor Rule ${idx + 1}: ${anchor.rule_id}`)
    console.log(`  Condition: ${anchor.condition}`)
    console.log(`  Precision: ${(anchor.precision * 100).toFixed(0)}%`)
    console.log(`  Coverage: ${(anchor.coverage * 100).toFixed(0)}%`)
    console.log(`  Examples: ${anchor.examples.join(', ')}`)
    console.log(`  Counter-examples: ${anchor.counterexamples.join(', ')}\n`)
  })
  
  return anchors
}

/**
 * Example 5: Partial Dependence Analysis
 * Shows how changing one variable affects overall risk
 */
export async function demoPDA() {
  console.log('=== Partial Dependence Analysis Demo ===\n')
  
  const pdaResults: PDPAnalysis = await analyzePartialDependence(
    exampleFinding,
    'sql_injection'
  )
  
  console.log(`Variable: ${pdaResults.variable_name}`)
  console.log('\nRisk by Variable Value:')
  
  pdaResults.variable_values.forEach((value, idx) => {
    console.log(`  ${value}: ${pdaResults.predicted_risk[idx].toFixed(2)}`)
  })
  
  if (pdaResults.interaction_effects.length > 0) {
    console.log('\nInteraction Effects:')
    pdaResults.interaction_effects.forEach(effect => {
      console.log(`  With ${effect.with_variable}: ${effect.interaction_strength.toFixed(3)}`)
    })
  }
  
  console.log(`\nInterpretation: ${pdaResults.interpretation}`)
  
  return pdaResults
}

/**
 * Example 6: Integrated Gradients - Feature Attribution
 * Calculates contribution of each feature to the vulnerability detection
 */
export async function demoIntegratedGradients() {
  console.log('=== Integrated Gradients Demo ===\n')
  
  const igResults: IntegratedGradient = await calculateIntegratedGradients(exampleFinding)
  
  console.log('Top Influential Factors:')
  igResults.influential_factors.forEach((factor, idx) => {
    console.log(`${idx + 1}. ${factor.factor}`)
    console.log(`   Attribution: ${factor.attribution.toFixed(3)}`)
    console.log(`   Confidence: ${(factor.confidence * 100).toFixed(0)}%\n`)
  })
  
  console.log(`Baseline Comparison: ${igResults.baseline_comparison}`)
  
  return igResults
}

/**
 * Example 7: Comprehensive XAI Analysis
 * Runs all XAI methods together for complete analysis
 */
export async function demoComprehensive() {
  console.log('=== Comprehensive XAI Analysis Demo ===\n')
  
  const results = await comprehensiveXAIAnalysis(exampleFinding)
  
  console.log('Summary:')
  console.log('  Top Contributing Factors:', results.summary.top_contributing_factors.join(', '))
  console.log(`  Confidence: ${(results.summary.confidence * 100).toFixed(0)}%`)
  console.log('  Minimal Fix:', results.summary.minimal_fix)
  console.log('  Key Condition:', results.summary.key_condition)
  console.log('  Algorithm:', results.summary.algorithm_info)
  
  console.log('\nDetailed Results:')
  console.log('  - SHAP: Feature importance analysis complete')
  console.log('  - LIME: Local explanation complete')
  console.log('  - Counterfactual: What-if analysis complete')
  console.log('  - Anchors:', results.anchor_rules.length, 'rules extracted')
  console.log('  - Integrated Gradients: Attribution analysis complete')
  
  return results
}

/**
 * Run all demos
 */
export async function runAllDemos() {
  await demoSHAP()
  await demoLIME()
  await demoCounterfactual()
  await demoAnchors()
  await demoPDA()
  await demoIntegratedGradients()
  await demoComprehensive()
}

// Example usage for testing:
// import { runAllDemos } from './xai-demo'
// await runAllDemos()
