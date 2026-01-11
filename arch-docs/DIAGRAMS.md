# Diagrams (Mermaid)

These diagrams reflect the current UX and component architecture.

Tip: GitHub renders Mermaid diagrams automatically in Markdown.

## UX – Sign-in and scenario sync (optional)

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant HB as HeaderBar
  participant AP as AuthProvider
  participant FA as Firebase Auth
  participant FS as Firestore
  participant S as Zustand Store

  U->>HB: Click "Sign in with Google"
  HB->>AP: signInWithGoogle()
  AP->>FA: signInWithPopup() / signInWithRedirect()
  FA-->>AP: Auth state changes
  AP->>AP: onAuthStateChanged()
  AP->>FS: getDoc(users/{uid})
  FS-->>AP: scenarios[]
  AP->>S: setScenarios(merge local+remote)

  Note over U,HB: After you save a scenario, the header shows sync status.
  S-->>AP: scenarios changed
  AP->>AP: debounce 600ms
  AP->>FS: setDoc(users/{uid}, {scenarios, updatedAt}, merge)
  FS-->>AP: ok / error
  AP-->>HB: scenarioSyncStatus = synced / error
```

## UX – Save / apply scenario (no page changes)

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant SC as SaveScenarioCard
  participant S as Zustand Store
  participant MC as MortgageCalculatorPage

  U->>MC: Edit inputs
  MC->>S: set*Raw(...) actions

  U->>SC: Pick from "Saved scenarios" dropdown
  SC->>S: applyScenario(id)
  S-->>MC: inputs updated
  S-->>SC: scenarioDraftName updated

  U->>SC: Click "Save scenario"
  SC->>S: saveScenario(name)
  Note over S: Upsert by (case-insensitive) name
  S-->>SC: scenarios updated
```

## App – Component / module map

```mermaid
flowchart LR
  subgraph Entry
    I["src/index.tsx"] --> AR["src/AppRoot.tsx"]
  end

  subgraph App
    AR --> HR[HashRouter]
    HR --> AP["src/auth/AuthProvider.tsx"]
    AP --> R[Routes]
  end

  subgraph Pages
    R --> MCP["src/pages/MortgageCalculatorPage.tsx"]
    R --> SCP["src/pages/ScenarioComparisonPage.tsx"]
    R --> RBP["src/pages/RefinanceBreakEvenPage.tsx"]
  end

  subgraph MortgagePage
    MCP --> HB["src/components/HeaderBar.tsx"]
    MCP --> IP["src/components/InputsPanel.tsx"]
    MCP --> SS["src/components/SidebarStats.tsx"]
    MCP --> SSC["src/components/SaveScenarioCard.tsx"]
    MCP --> CSC["src/components/CostSummaryCard.tsx"]
    MCP --> SCH["src/components/ScheduleSection.tsx"]
    MCP --> CM["src/components/ui/ConfirmModal.tsx"]
  end

  subgraph StateAndLogic
    IP --> MS["src/store/mortgageStore.ts"]
    SSC --> MS
    SCH --> MS
    MCP --> HMI["src/hooks/useMortgageInputs.ts"]
    MCP --> MATH["src/lib/mortgage.ts"]
    MCP --> LYG["src/hooks/useLoanYearGroups.ts"]
  end

  subgraph Exports
    SCH --> CSV["src/lib/scheduleCsv.ts"]
    SCH --> DL["src/lib/download.ts"]
    SCH --> PDF["src/lib/pdfReport.ts"]
    PDF --> RPDF["src/pdf/MortgageReportPdf.tsx"]
  end

  subgraph FirebaseOptional
    AP --> FB["src/lib/firebase.ts"]
    AP --> FS["Firestore users/uid"]
    HB --> AC["src/auth/useAuth.ts"]
  end
```

## Mortgage scenario state (store)

```mermaid
flowchart TB
  subgraph Store["src/store/mortgageStore.ts"]
    Raw[Raw inputs strings] --> Parsed["useMortgageInputs() numeric"]
    Scenarios["scenarios: Scenario[]"]
    Active[activeScenarioId]
    Draft[scenarioDraftName]
  end

  Draft -->|Save scenario| Scenarios
  Scenarios -->|Apply scenario| Active
  Active --> Draft
  Active --> Raw

  Note1["saveScenario(name) upserts by name\n(case-insensitive)"]
  Draft -.-> Note1
```
