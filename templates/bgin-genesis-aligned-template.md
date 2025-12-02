# 🌐 BGIN Genesis-Aligned Governance Framework Template
## Building on the Blockchain Governance Initiative Network Foundation

### Overview

This template provides a comprehensive framework for organizations to build governance systems that align with the [BGIN Genesis principles](https://github.com/bgin-global/genesis-documents/blob/master/Genesis.md) while leveraging the open source ecosystem framework. It serves as a bridge between BGIN's foundational values and practical implementation for diverse organizations.

---

## 📜 BGIN Genesis Principles Integration

### Core Values Alignment

The BGIN Genesis document establishes fundamental principles that guide sustainable blockchain ecosystem development. This template ensures your organization's governance framework embodies these values:

#### 1. **Tangible Societal Impact**
- **BGIN Principle**: Focus on creating real-world positive change
- **Implementation**: Measure and track societal impact metrics
- **Template Integration**: Built-in impact assessment tools and reporting

#### 2. **Openness and Inclusivity**
- **BGIN Principle**: Open platform for diverse stakeholder discussions
- **Implementation**: Transparent participation mechanisms
- **Template Integration**: Multi-stakeholder engagement frameworks

#### 3. **Diversity**
- **BGIN Principle**: Embrace diverse perspectives and backgrounds
- **Implementation**: Inclusive recruitment and participation policies
- **Template Integration**: Diversity metrics and inclusion tools

#### 4. **Transparency**
- **BGIN Principle**: Open and transparent decision-making processes
- **Implementation**: Public documentation and real-time updates
- **Template Integration**: Automated transparency reporting

#### 5. **Bottom-Up Decision-Making**
- **BGIN Principle**: Community-driven governance processes
- **Implementation**: Decentralized decision-making mechanisms
- **Template Integration**: Participatory governance tools

#### 6. **Fairness and Neutrality**
- **BGIN Principle**: Equal treatment of all participants
- **Implementation**: Neutral facilitation and fair processes
- **Template Integration**: Bias detection and fairness metrics

---

## 🏗️ Organization Configuration Template

### Basic Information

```yaml
# Organization Identity (BGIN-Aligned)
organization:
  name: "{{ORGANIZATION_NAME}}"
  type: "{{ORGANIZATION_TYPE}}" # dao, corporation, community, government, ngo
  domain: "{{ORGANIZATION_DOMAIN}}"
  logo: "{{ORGANIZATION_LOGO}}"
  description: "{{ORGANIZATION_DESCRIPTION}}"
  
  # BGIN Genesis Alignment
  bginAlignment:
    genesisPrinciples: true
    societalImpact: "{{SOCIETAL_IMPACT_FOCUS}}"
    opennessLevel: "{{OPENNESS_LEVEL}}" # basic, enhanced, maximum
    diversityCommitment: "{{DIVERSITY_COMMITMENT}}"
    transparencyLevel: "{{TRANSPARENCY_LEVEL}}" # basic, enhanced, maximum
    decisionMaking: "{{DECISION_MAKING_MODEL}}" # bottom-up, hybrid, representative
    fairnessMeasures: "{{FAIRNESS_MEASURES}}"
```

### BGIN-Aligned Governance Structure

```yaml
# Governance Structure (BGIN Genesis Compliant)
governance:
  # Core BGIN Principles Implementation
  principles:
    tangibleImpact:
      enabled: true
      metrics:
        - "societal_benefit_score"
        - "community_impact_measure"
        - "sustainability_index"
      reporting: "{{IMPACT_REPORTING_FREQUENCY}}"
    
    openness:
      enabled: true
      measures:
        - "public_documentation"
        - "open_meetings"
        - "transparent_processes"
        - "stakeholder_access"
      level: "{{OPENNESS_LEVEL}}"
    
    inclusivity:
      enabled: true
      measures:
        - "diverse_participation"
        - "barrier_removal"
        - "accessibility_features"
        - "cultural_sensitivity"
      targets:
        diversity: "{{DIVERSITY_TARGET}}"
        inclusion: "{{INCLUSION_TARGET}}"
    
    transparency:
      enabled: true
      measures:
        - "real_time_reporting"
        - "decision_tracking"
        - "financial_transparency"
        - "process_documentation"
      level: "{{TRANSPARENCY_LEVEL}}"
    
    bottomUp:
      enabled: true
      mechanisms:
        - "community_proposals"
        - "participatory_voting"
        - "stakeholder_consultation"
        - "consensus_building"
      empowerment: "{{EMPOWERMENT_LEVEL}}"
    
    fairness:
      enabled: true
      measures:
        - "neutral_facilitation"
        - "equal_representation"
        - "bias_detection"
        - "conflict_resolution"
      monitoring: "{{FAIRNESS_MONITORING}}"

  # Stakeholder Engagement (BGIN-Style)
  stakeholders:
    primary:
      - name: "community_members"
        role: "decision_makers"
        representation: "{{COMMUNITY_REPRESENTATION}}"
        engagement: "{{COMMUNITY_ENGAGEMENT_LEVEL}}"
      - name: "technical_experts"
        role: "advisors"
        representation: "{{TECHNICAL_REPRESENTATION}}"
        engagement: "{{TECHNICAL_ENGAGEMENT_LEVEL}}"
      - name: "policy_makers"
        role: "regulatory_guidance"
        representation: "{{POLICY_REPRESENTATION}}"
        engagement: "{{POLICY_ENGAGEMENT_LEVEL}}"
    
    secondary:
      - name: "academic_researchers"
        role: "research_partners"
        representation: "{{ACADEMIC_REPRESENTATION}}"
        engagement: "{{ACADEMIC_ENGAGEMENT_LEVEL}}"
      - name: "civil_society"
        role: "advocacy_partners"
        representation: "{{CIVIL_SOCIETY_REPRESENTATION}}"
        engagement: "{{CIVIL_SOCIETY_ENGAGEMENT_LEVEL}}"
      - name: "industry_partners"
        role: "implementation_partners"
        representation: "{{INDUSTRY_REPRESENTATION}}"
        engagement: "{{INDUSTRY_ENGAGEMENT_LEVEL}}"
```

### BGIN-Aligned Agent Configuration

```yaml
# Multi-Agent System (BGIN Genesis Principles)
agents:
  # Core BGIN Agents
  bginCore:
    # Impact Assessment Agent
    impact:
      name: "bgin-impact-agent"
      enabled: true
      model: "kwaainet/llama-3.2-70b-instruct"
      capabilities:
        - "societal_impact_assessment"
        - "sustainability_analysis"
        - "community_benefit_measurement"
        - "long_term_impact_prediction"
      configuration:
        impactMetrics:
          - "social_equity_improvement"
          - "environmental_sustainability"
          - "economic_empowerment"
          - "knowledge_sharing"
        assessmentFrequency: "{{IMPACT_ASSESSMENT_FREQUENCY}}"
        reportingFormat: "{{IMPACT_REPORTING_FORMAT}}"
    
    # Transparency Agent
    transparency:
      name: "bgin-transparency-agent"
      enabled: true
      model: "kwaainet/llama-3.2-70b-instruct"
      capabilities:
        - "transparency_monitoring"
        - "openness_assessment"
        - "stakeholder_communication"
        - "process_documentation"
      configuration:
        transparencyLevel: "{{TRANSPARENCY_LEVEL}}"
        reportingFrequency: "{{TRANSPARENCY_REPORTING_FREQUENCY}}"
        stakeholderNotifications: "{{STAKEHOLDER_NOTIFICATIONS}}"
        publicAccess: "{{PUBLIC_ACCESS_LEVEL}}"
    
    # Inclusivity Agent
    inclusivity:
      name: "bgin-inclusivity-agent"
      enabled: true
      model: "kwaainet/llama-3.2-70b-instruct"
      capabilities:
        - "diversity_monitoring"
        - "inclusion_assessment"
        - "barrier_identification"
        - "accessibility_improvement"
      configuration:
        diversityTargets:
          - "gender_balance"
          - "geographic_diversity"
          - "cultural_inclusion"
          - "socioeconomic_diversity"
        inclusionMeasures:
          - "accessibility_features"
          - "language_support"
          - "cultural_sensitivity"
          - "participation_barriers"
    
    # Consensus Agent
    consensus:
      name: "bgin-consensus-agent"
      enabled: true
      model: "kwaainet/llama-3.2-70b-instruct"
      capabilities:
        - "consensus_building"
        - "conflict_resolution"
        - "stakeholder_mediation"
        - "decision_facilitation"
      configuration:
        consensusMethod: "{{CONSENSUS_METHOD}}"
        conflictResolution: "{{CONFLICT_RESOLUTION_METHOD}}"
        mediationProcess: "{{MEDIATION_PROCESS}}"
        facilitationStyle: "{{FACILITATION_STYLE}}"
    
    # Fairness Agent
    fairness:
      name: "bgin-fairness-agent"
      enabled: true
      model: "kwaainet/llama-3.2-70b-instruct"
      capabilities:
        - "bias_detection"
        - "fairness_assessment"
        - "equity_monitoring"
        - "neutrality_verification"
      configuration:
        biasDetection:
          - "algorithmic_bias"
          - "decision_bias"
          - "representation_bias"
          - "process_bias"
        fairnessMetrics:
          - "equal_opportunity"
          - "proportional_representation"
          - "unbiased_decision_making"
          - "neutral_facilitation"

  # Organization-Specific Agents (BGIN-Aligned)
  organizationSpecific:
    # Societal Impact Agent
    - name: "societal-impact-agent"
      enabled: "{{SOCIETAL_IMPACT_AGENT_ENABLED}}"
      model: "kwaainet/llama-3.2-70b-instruct"
      capabilities:
        - "impact_measurement"
        - "sustainability_tracking"
        - "community_benefit_analysis"
        - "social_value_creation"
      configuration:
        impactFramework: "{{IMPACT_FRAMEWORK}}"
        measurementTools: "{{MEASUREMENT_TOOLS}}"
        reportingStandards: "{{REPORTING_STANDARDS}}"
    
    # Stakeholder Engagement Agent
    - name: "stakeholder-engagement-agent"
      enabled: "{{STAKEHOLDER_ENGAGEMENT_AGENT_ENABLED}}"
      model: "kwaainet/llama-3.2-70b-instruct"
      capabilities:
        - "stakeholder_mapping"
        - "engagement_strategy"
        - "participation_optimization"
        - "relationship_management"
      configuration:
        stakeholderGroups: "{{STAKEHOLDER_GROUPS}}"
        engagementMethods: "{{ENGAGEMENT_METHODS}}"
        participationIncentives: "{{PARTICIPATION_INCENTIVES}}"
    
    # Transparency Reporting Agent
    - name: "transparency-reporting-agent"
      enabled: "{{TRANSPARENCY_REPORTING_AGENT_ENABLED}}"
      model: "kwaainet/llama-3.2-70b-instruct"
      capabilities:
        - "automated_reporting"
        - "transparency_auditing"
        - "stakeholder_communication"
        - "compliance_monitoring"
      configuration:
        reportingFrequency: "{{REPORTING_FREQUENCY}}"
        auditSchedule: "{{AUDIT_SCHEDULE}}"
        communicationChannels: "{{COMMUNICATION_CHANNELS}}"
```

### BGIN-Aligned Decision-Making Processes

```yaml
# Decision-Making (BGIN Genesis Compliant)
decisionMaking:
  # Bottom-Up Process
  bottomUp:
    enabled: true
    stages:
      - name: "community_ideation"
        description: "Community members propose ideas and solutions"
        duration: "{{IDEATION_DURATION}}"
        participation: "open_to_all"
        facilitation: "community_led"
      
      - name: "stakeholder_consultation"
        description: "Diverse stakeholders provide input and feedback"
        duration: "{{CONSULTATION_DURATION}}"
        participation: "stakeholder_groups"
        facilitation: "neutral_facilitation"
      
      - name: "consensus_building"
        description: "Build consensus through dialogue and compromise"
        duration: "{{CONSENSUS_DURATION}}"
        participation: "all_stakeholders"
        facilitation: "consensus_facilitation"
      
      - name: "decision_implementation"
        description: "Implement decisions with transparency and accountability"
        duration: "{{IMPLEMENTATION_DURATION}}"
        participation: "implementation_team"
        facilitation: "project_management"
  
  # Transparency Measures
  transparency:
    realTimeReporting: "{{REAL_TIME_REPORTING_ENABLED}}"
    publicDocumentation: "{{PUBLIC_DOCUMENTATION_ENABLED}}"
    stakeholderUpdates: "{{STAKEHOLDER_UPDATES_ENABLED}}"
    decisionTracking: "{{DECISION_TRACKING_ENABLED}}"
  
  # Inclusivity Measures
  inclusivity:
    diverseParticipation: "{{DIVERSE_PARTICIPATION_ENABLED}}"
    accessibilityFeatures: "{{ACCESSIBILITY_FEATURES_ENABLED}}"
    culturalSensitivity: "{{CULTURAL_SENSITIVITY_ENABLED}}"
    barrierRemoval: "{{BARRIER_REMOVAL_ENABLED}}"
  
  # Fairness Measures
  fairness:
    neutralFacilitation: "{{NEUTRAL_FACILITATION_ENABLED}}"
    equalRepresentation: "{{EQUAL_REPRESENTATION_ENABLED}}"
    biasDetection: "{{BIAS_DETECTION_ENABLED}}"
    conflictResolution: "{{CONFLICT_RESOLUTION_ENABLED}}"
```

### BGIN-Aligned Monitoring and Metrics

```yaml
# Monitoring (BGIN Genesis Principles)
monitoring:
  # Societal Impact Metrics
  societalImpact:
    enabled: "{{SOCIETAL_IMPACT_MONITORING_ENABLED}}"
    metrics:
      - name: "community_benefit_score"
        description: "Measurable benefit to community"
        target: "{{COMMUNITY_BENEFIT_TARGET}}"
        measurement: "{{COMMUNITY_BENEFIT_MEASUREMENT}}"
      
      - name: "sustainability_index"
        description: "Environmental and social sustainability"
        target: "{{SUSTAINABILITY_TARGET}}"
        measurement: "{{SUSTAINABILITY_MEASUREMENT}}"
      
      - name: "knowledge_sharing_impact"
        description: "Contribution to knowledge sharing"
        target: "{{KNOWLEDGE_SHARING_TARGET}}"
        measurement: "{{KNOWLEDGE_SHARING_MEASUREMENT}}"
  
  # Transparency Metrics
  transparency:
    enabled: "{{TRANSPARENCY_MONITORING_ENABLED}}"
    metrics:
      - name: "transparency_score"
        description: "Overall transparency level"
        target: "{{TRANSPARENCY_TARGET}}"
        measurement: "{{TRANSPARENCY_MEASUREMENT}}"
      
      - name: "stakeholder_satisfaction"
        description: "Stakeholder satisfaction with transparency"
        target: "{{STAKEHOLDER_SATISFACTION_TARGET}}"
        measurement: "{{STAKEHOLDER_SATISFACTION_MEASUREMENT}}"
      
      - name: "public_accessibility"
        description: "Public access to information"
        target: "{{PUBLIC_ACCESSIBILITY_TARGET}}"
        measurement: "{{PUBLIC_ACCESSIBILITY_MEASUREMENT}}"
  
  # Inclusivity Metrics
  inclusivity:
    enabled: "{{INCLUSIVITY_MONITORING_ENABLED}}"
    metrics:
      - name: "diversity_index"
        description: "Diversity of participants"
        target: "{{DIVERSITY_TARGET}}"
        measurement: "{{DIVERSITY_MEASUREMENT}}"
      
      - name: "inclusion_score"
        description: "Inclusion of diverse voices"
        target: "{{INCLUSION_TARGET}}"
        measurement: "{{INCLUSION_MEASUREMENT}}"
      
      - name: "accessibility_rating"
        description: "Accessibility of processes"
        target: "{{ACCESSIBILITY_TARGET}}"
        measurement: "{{ACCESSIBILITY_MEASUREMENT}}"
  
  # Fairness Metrics
  fairness:
    enabled: "{{FAIRNESS_MONITORING_ENABLED}}"
    metrics:
      - name: "bias_detection_score"
        description: "Detection and mitigation of bias"
        target: "{{BIAS_DETECTION_TARGET}}"
        measurement: "{{BIAS_DETECTION_MEASUREMENT}}"
      
      - name: "equity_index"
        description: "Equity in decision-making"
        target: "{{EQUITY_TARGET}}"
        measurement: "{{EQUITY_MEASUREMENT}}"
      
      - name: "neutrality_rating"
        description: "Neutrality of facilitation"
        target: "{{NEUTRALITY_TARGET}}"
        measurement: "{{NEUTRALITY_MEASUREMENT}}"
```

### BGIN-Aligned Integration Framework

```yaml
# External Integrations (BGIN Ecosystem)
integrations:
  # BGIN Network Integration
  bginNetwork:
    enabled: "{{BGIN_NETWORK_INTEGRATION_ENABLED}}"
    configuration:
      networkId: "{{BGIN_NETWORK_ID}}"
      nodeAddress: "{{BGIN_NODE_ADDRESS}}"
      consensusProtocol: "{{BGIN_CONSENSUS_PROTOCOL}}"
      governanceContract: "{{BGIN_GOVERNANCE_CONTRACT}}"
    
    capabilities:
      - "cross_organization_governance"
      - "shared_governance_intelligence"
      - "inter_organization_consensus"
      - "network_wide_transparency"
  
  # Blockchain Integration
  blockchain:
    enabled: "{{BLOCKCHAIN_INTEGRATION_ENABLED}}"
    configuration:
      blockchain: "{{BLOCKCHAIN_TYPE}}" # ethereum, polygon, solana, etc.
      smartContracts: "{{SMART_CONTRACTS}}"
      governanceToken: "{{GOVERNANCE_TOKEN}}"
      votingMechanism: "{{VOTING_MECHANISM}}"
    
    capabilities:
      - "on_chain_governance"
      - "transparent_voting"
      - "immutable_decision_records"
      - "automated_execution"
  
  # Stakeholder Communication
  communication:
    - name: "bgin_forum"
      enabled: "{{BGIN_FORUM_ENABLED}}"
      type: "discussion_platform"
      configuration:
        forumUrl: "{{BGIN_FORUM_URL}}"
        categories: "{{FORUM_CATEGORIES}}"
        moderation: "{{FORUM_MODERATION}}"
    
    - name: "stakeholder_portal"
      enabled: "{{STAKEHOLDER_PORTAL_ENABLED}}"
      type: "information_portal"
      configuration:
        portalUrl: "{{STAKEHOLDER_PORTAL_URL}}"
        accessLevel: "{{PORTAL_ACCESS_LEVEL}}"
        contentTypes: "{{PORTAL_CONTENT_TYPES}}"
```

---

## 🚀 Implementation Guide

### Phase 1: BGIN Genesis Alignment (Months 1-3)

1. **Assess Current State**
   - Evaluate existing governance against BGIN principles
   - Identify gaps in transparency, inclusivity, and impact
   - Map current stakeholders and engagement levels

2. **Implement Core Principles**
   - Deploy BGIN-aligned agents
   - Establish transparency reporting
   - Create inclusivity measures
   - Set up impact tracking

3. **Stakeholder Engagement**
   - Map all stakeholder groups
   - Establish communication channels
   - Create participation mechanisms
   - Train stakeholders on new processes

### Phase 2: Advanced BGIN Integration (Months 4-9)

1. **Enhanced Transparency**
   - Implement real-time reporting
   - Create public dashboards
   - Establish audit processes
   - Enable stakeholder access

2. **Inclusivity Enhancement**
   - Deploy diversity monitoring
   - Create accessibility features
   - Establish cultural sensitivity measures
   - Remove participation barriers

3. **Impact Measurement**
   - Deploy impact assessment tools
   - Create sustainability tracking
   - Establish community benefit measurement
   - Implement long-term impact prediction

### Phase 3: BGIN Network Integration (Months 10-18)

1. **Network Participation**
   - Connect to BGIN network
   - Share governance intelligence
   - Participate in cross-organization governance
   - Contribute to network standards

2. **Advanced Features**
   - Deploy consensus building tools
   - Implement conflict resolution mechanisms
   - Create fairness monitoring systems
   - Establish bias detection tools

3. **Ecosystem Leadership**
   - Lead governance innovation
   - Mentor other organizations
   - Contribute to BGIN development
   - Share best practices

---

## 📊 Success Metrics

### BGIN Genesis Compliance

```yaml
# BGIN Genesis Compliance Metrics
bginCompliance:
  tangibleImpact:
    score: "{{TANGIBLE_IMPACT_SCORE}}"
    target: "{{TANGIBLE_IMPACT_TARGET}}"
    measurement: "{{TANGIBLE_IMPACT_MEASUREMENT}}"
  
  openness:
    score: "{{OPENNESS_SCORE}}"
    target: "{{OPENNESS_TARGET}}"
    measurement: "{{OPENNESS_MEASUREMENT}}"
  
  inclusivity:
    score: "{{INCLUSIVITY_SCORE}}"
    target: "{{INCLUSIVITY_TARGET}}"
    measurement: "{{INCLUSIVITY_MEASUREMENT}}"
  
  transparency:
    score: "{{TRANSPARENCY_SCORE}}"
    target: "{{TRANSPARENCY_TARGET}}"
    measurement: "{{TRANSPARENCY_MEASUREMENT}}"
  
  bottomUp:
    score: "{{BOTTOM_UP_SCORE}}"
    target: "{{BOTTOM_UP_TARGET}}"
    measurement: "{{BOTTOM_UP_MEASUREMENT}}"
  
  fairness:
    score: "{{FAIRNESS_SCORE}}"
    target: "{{FAIRNESS_TARGET}}"
    measurement: "{{FAIRNESS_MEASUREMENT}}"
```

### Overall Governance Effectiveness

```yaml
# Overall Effectiveness Metrics
effectiveness:
  stakeholderSatisfaction: "{{STAKEHOLDER_SATISFACTION_SCORE}}"
  decisionQuality: "{{DECISION_QUALITY_SCORE}}"
  processEfficiency: "{{PROCESS_EFFICIENCY_SCORE}}"
  innovationLevel: "{{INNOVATION_LEVEL_SCORE}}"
  sustainabilityIndex: "{{SUSTAINABILITY_INDEX_SCORE}}"
```

---

## 🎯 Getting Started

### Immediate Actions (Next 30 days)

1. **Review BGIN Genesis Document**
   - Study the [BGIN Genesis principles](https://github.com/bgin-global/genesis-documents/blob/master/Genesis.md)
   - Understand your organization's alignment needs
   - Identify key stakeholders and their roles

2. **Deploy BGIN-Aligned Framework**
   ```bash
   git clone https://github.com/bgin-global/BGIN-Agent-Framework.git
   cd BGIN-Agent-Framework
   cp templates/bgin-genesis-aligned-template.md your-organization-governance.md
   # Customize the template for your organization
   ```

3. **Configure BGIN Agents**
   - Set up impact assessment agent
   - Configure transparency reporting agent
   - Deploy inclusivity monitoring agent
   - Establish consensus building tools

### Short-term Goals (Next 90 days)

1. **Implement Core Principles**
   - Establish transparency measures
   - Create inclusivity initiatives
   - Set up impact tracking
   - Deploy stakeholder engagement tools

2. **Train Your Team**
   - Provide BGIN principles training
   - Create governance documentation
   - Establish best practices
   - Build internal expertise

3. **Engage Stakeholders**
   - Map all stakeholder groups
   - Create communication channels
   - Establish participation mechanisms
   - Gather feedback and iterate

### Long-term Vision (Next 12 months)

1. **Achieve BGIN Compliance**
   - Meet all BGIN Genesis principles
   - Establish transparent processes
   - Create inclusive participation
   - Measure tangible impact

2. **Join BGIN Network**
   - Connect to BGIN ecosystem
   - Share governance intelligence
   - Participate in network governance
   - Contribute to standards development

3. **Lead Governance Innovation**
   - Develop new governance patterns
   - Mentor other organizations
   - Contribute to BGIN development
   - Share best practices globally

---

## 📚 Resources

### BGIN Documentation
- [BGIN Genesis Document](https://github.com/bgin-global/genesis-documents/blob/master/Genesis.md)
- [BGIN Agent Framework](https://github.com/bgin-global/BGIN-Agent-Framework)
- [BGIN Community](https://github.com/bgin-global)

### Implementation Support
- **Documentation**: [BGIN Framework Docs](./README.md)
- **Issues**: [GitHub Issues](https://github.com/bgin-global/BGIN-Agent-Framework/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bgin-global/BGIN-Agent-Framework/discussions)
- **Community**: Join the BGIN community for support and collaboration

---

**This template ensures your organization builds governance systems that not only meet your specific needs but also align with the foundational principles of the Blockchain Governance Initiative Network, creating a more transparent, inclusive, and impactful governance ecosystem.** 🌐

*Built on the foundation of [BGIN Genesis principles](https://github.com/bgin-global/genesis-documents/blob/master/Genesis.md) and the open source ecosystem framework.*
