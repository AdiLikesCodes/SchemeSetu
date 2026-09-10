import { create } from 'zustand'

const API_BASE = 'http://localhost:8000/api/v1'

const INITIAL_PROFILE = {
  name: '',
  age: null,
  gender: '',
  category: 'SC',
  income: 0,
  occupation: '',
  businessType: '',
  projectCost: 0,
  loanRequirement: 0,
  state: '',
  district: '',
  pinCode: '',
  role: 'beneficiary', // 'beneficiary' | 'admin'
  isAuthenticated: false,
}

const loadSavedUserSession = () => {
  try {
    const saved = localStorage.getItem('schemesetu_user')
    const savedId = localStorage.getItem('schemesetu_beneficiary_id')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && parsed.isAuthenticated) {
        return { userProfile: parsed, beneficiaryId: savedId || parsed.user_id || `user-${Date.now()}` }
      }
    }
  } catch (e) {
    console.error('Error reading saved session:', e)
  }
  return { userProfile: INITIAL_PROFILE, beneficiaryId: `user-${Date.now()}` }
}

const savedSession = loadSavedUserSession()

const SAMPLE_SCHEMES = [
  {
    id: 'nsfdc-term-loan',
    name: 'NSFDC Term Loan',
    ministry: 'Ministry of Social Justice and Empowerment',
    purpose: 'Direct loan assistance for economic activities in manufacturing & services',
    targetBeneficiaries: 'Scheduled Caste (SC) individuals with annual income up to ₹3.00 Lakh',
    eligible: true,
    maxLoan: 500000,
    maxLoanText: 'Up to ₹5.00 Lakh',
    interestRate: '6% p.a.',
    moratorium: '6 Months',
    repaymentPeriod: '5 Years',
    subsidy: '10% Margin Money Assistance',
    matchedRules: [
      'SC category requirement satisfied',
      'Annual income within ₹3.00 Lakh ceiling',
      'Age requirement (18-50 years) satisfied',
      'Micro Manufacturing business activity eligible'
    ],
    failedRules: [],
    documentsNeeded: ['Aadhaar', 'Caste Certificate', 'Income Certificate', 'Project Report'],
  },
  {
    id: 'micro-finance-scheme',
    name: 'Micro Finance Scheme (NSFDC)',
    ministry: 'Ministry of Social Justice and Empowerment',
    purpose: 'Small loans for micro-enterprises and self-help groups',
    targetBeneficiaries: 'SC individuals requiring small capital',
    eligible: true,
    maxLoan: 140000,
    maxLoanText: 'Up to ₹1.40 Lakh',
    interestRate: '5% p.a.',
    moratorium: '3 Months',
    repaymentPeriod: '3 Years',
    subsidy: 'Interest Concession',
    matchedRules: [
      'SC category verified',
      'Low income eligibility met',
      'Self-employment profile matches scheme criteria'
    ],
    failedRules: [],
    documentsNeeded: ['Aadhaar', 'Caste Certificate', 'Income Certificate'],
  },
  {
    id: 'dmrc-self-employment',
    name: 'DMRC Self-Employment Scheme',
    ministry: 'State Backward Classes Development Corporation',
    purpose: 'Financial assistance for setting up self-employment ventures',
    targetBeneficiaries: 'Target group youth seeking self-employment',
    eligible: true,
    maxLoan: 300000,
    maxLoanText: 'Up to ₹3.00 Lakh',
    interestRate: '6.5% p.a.',
    moratorium: '6 Months',
    repaymentPeriod: '4 Years',
    subsidy: '5% Interest Subsidy',
    matchedRules: [
      'Resident of Kerala',
      'Target group category matched',
      'Age 28 satisfies 18-45 limit'
    ],
    failedRules: [],
    documentsNeeded: ['Aadhaar', 'Income Certificate', 'Ration Card'],
  },
  {
    id: 'standup-india',
    name: 'Stand-Up India Scheme',
    ministry: 'Ministry of Finance',
    purpose: 'Bank loans for greenfield enterprises set up by SC/ST or Women borrowers',
    targetBeneficiaries: 'SC/ST and Women entrepreneurs for projects over ₹10 Lakh',
    eligible: false,
    maxLoan: 10000000,
    maxLoanText: '₹10.00 Lakh to ₹1.00 Crore',
    interestRate: 'Base Rate + 3%',
    moratorium: '18 Months',
    repaymentPeriod: '7 Years',
    subsidy: 'Government Guarantee Cover',
    matchedRules: ['SC Category requirement satisfied'],
    failedRules: [
      {
        rule: 'Minimum Project Cost requirement',
        required: '≥ ₹10.00 Lakh',
        actual: 'Your Project Cost: ₹5.00 Lakh'
      },
      {
        rule: 'Income / Turnover limit threshold',
        required: 'Greenfield project required with min ₹10L investment',
        actual: 'Project size too small for Stand-Up India'
      }
    ],
    documentsNeeded: ['Aadhaar', 'Caste Certificate', 'Detailed Project Report', 'Bank Statement'],
  },
]

const SAMPLE_PARTNERS = [
  {
    id: 'p1',
    name: 'Kerala State Development Corporation for SC/ST (SCA)',
    type: 'State Channelizing Agency (SCA)',
    distance: '2.3 km away',
    address: 'Vanchiyoor, Thiruvananthapuram, Kerala 695035',
    district: 'Thiruvananthapuram',
    state: 'Kerala',
    pinCode: '695035',
    lat: 8.4985,
    lng: 76.9423,
    phone: '+91 471 2305678',
    supportedSchemes: ['NSFDC Term Loan', 'Micro Finance Scheme (NSFDC)', 'DMRC Self-Employment Scheme', 'Stand-Up India Scheme'],
    available: true,
    lastUpdated: '2 hours ago',
    rating: 4.8,
  },
  {
    id: 'p2',
    name: 'Canara Bank - Lead District Office (Channel Partner)',
    type: 'Nationalized Bank Branch',
    distance: '3.8 km away',
    address: 'MG Road, Statue, Thiruvananthapuram, Kerala 695001',
    district: 'Thiruvananthapuram',
    state: 'Kerala',
    pinCode: '695001',
    lat: 8.4912,
    lng: 76.9531,
    phone: '+91 471 2471122',
    supportedSchemes: ['NSFDC Term Loan', 'DMRC Self-Employment Scheme', 'Micro Finance Scheme (NSFDC)'],
    available: true,
    lastUpdated: '1 day ago',
    rating: 4.5,
  },
  {
    id: 'p3',
    name: 'State Bank of India - SME & Financial Inclusion Branch',
    type: 'Public Sector Bank',
    distance: '5.1 km away',
    address: 'East Fort, Thiruvananthapuram, Kerala 695023',
    district: 'Thiruvananthapuram',
    state: 'Kerala',
    pinCode: '695023',
    lat: 8.4827,
    lng: 76.9465,
    phone: '+91 471 2509988',
    supportedSchemes: ['NSFDC Term Loan', 'Stand-Up India Scheme', 'DMRC Self-Employment Scheme'],
    available: true,
    lastUpdated: '4 hours ago',
    rating: 4.6,
  },
  {
    id: 'p4',
    name: 'District Industries Centre (DIC) Facilitation Desk',
    type: 'District Government Office',
    distance: '4.2 km away',
    address: 'Vellayambalam, Thiruvananthapuram, Kerala 695010',
    district: 'Thiruvananthapuram',
    state: 'Kerala',
    pinCode: '695010',
    lat: 8.5144,
    lng: 76.9592,
    phone: '+91 471 2314567',
    supportedSchemes: ['NSFDC Term Loan', 'Micro Finance Scheme (NSFDC)', 'Stand-Up India Scheme', 'DMRC Self-Employment Scheme'],
    available: true,
    lastUpdated: '3 hours ago',
    rating: 4.7,
  },
]

const SAMPLE_DOCUMENTS = [
  {
    id: 'doc-1',
    name: 'Aadhaar Card',
    type: 'identity',
    status: 'verified',
    uploadDate: '2026-09-08',
    extractedData: {
      name: 'Verified Aadhaar Beneficiary',
      uid: 'XXXX-XXXX-9012',
      gender: 'Male',
      dob: '1998-05-14',
      pincode: '695001',
    },
  },
  {
    id: 'doc-2',
    name: 'SC Caste Certificate',
    type: 'caste',
    status: 'verified',
    uploadDate: '2026-09-08',
    extractedData: {
      category: 'Scheduled Caste (SC)',
      issuingAuthority: 'Tehsildar Thiruvananthapuram',
      certificateNo: 'CC/2025/88921',
    },
  },
  {
    id: 'doc-3',
    name: 'Income Certificate',
    type: 'income',
    status: 'verified',
    uploadDate: '2026-09-09',
    extractedData: {
      annualIncome: '₹3,00,000',
      validUntil: '2027-03-31',
    },
  },
  {
    id: 'doc-4',
    name: 'UDYAM Registration Certificate',
    type: 'business',
    status: 'pending_upload',
    uploadDate: null,
    extractedData: null,
  },
]

const INITIAL_APPLICATION = {
  applicationId: 'SS10234',
  schemeId: 'nsfdc-term-loan',
  schemeName: 'NSFDC Term Loan',
  partnerName: 'Kerala State Development Corporation for SC/ST (SCA)',
  submissionDate: '2026-09-09',
  currentStatus: 'Under Review',
  currentStep: 4, // 1: Matched, 2: Docs Prepared, 3: Partner Selected, 4: Submitted, 5: Under Review, 6: Approved, 7: Disbursed
  requiredAction: 'None currently. Verification officer assigned.',
  steps: [
    { title: 'Scheme Matched', status: 'completed', date: 'Sep 07, 2026' },
    { title: 'Documents Prepared', status: 'completed', date: 'Sep 08, 2026' },
    { title: 'Channel Partner Selected', status: 'completed', date: 'Sep 09, 2026' },
    { title: 'Application Submitted', status: 'completed', date: 'Sep 09, 2026' },
    { title: 'Under Review', status: 'current', date: 'In Progress' },
    { title: 'Sanction & Approval', status: 'upcoming', date: 'Pending' },
    { title: 'Fund Disbursal', status: 'upcoming', date: 'Pending' },
  ],
}

export function evaluateSchemesForProfile(profile, schemeList = SAMPLE_SCHEMES) {
  const userCat = (profile?.category || 'SC').toUpperCase()
  const userIncome = Number(profile?.income || 0)
  const userAge = profile?.age ? Number(profile.age) : null
  const userProjectCost = Number(profile?.projectCost || 0)

  return schemeList.map(scheme => {
    const matchedRules = []
    const failedRules = []

    // Rule 1: Category Check
    if (['nsfdc-term-loan', 'micro-finance-scheme', 'MOSJEBIZ-001', 'NSFDC-TERM-01', 'NSFDC-MICRO-02'].includes(scheme.id)) {
      if (['SC', 'ST', 'OBC', 'EWS'].includes(userCat)) {
        matchedRules.push(`${userCat} category requirement satisfied`)
      } else {
        failedRules.push({ rule: 'Category requirement', required: 'Scheduled Caste / ST / OBC', actual: `Your category: ${userCat}` })
      }
    } else if (scheme.id === 'dmrc-self-employment') {
      if (['SC', 'ST', 'OBC'].includes(userCat)) {
        matchedRules.push(`Category ${userCat} verified for assistance`)
      } else {
        failedRules.push({ rule: 'Category requirement', required: 'SC / ST / OBC', actual: `Your category: ${userCat}` })
      }
    } else if (scheme.id === 'standup-india' || scheme.id === 'STANDUP-IND-03') {
      if (['SC', 'ST'].includes(userCat) || profile?.gender?.toLowerCase() === 'female') {
        matchedRules.push('SC/ST/Woman entrepreneur criteria met')
      } else {
        failedRules.push({ rule: 'Target Category', required: 'SC / ST or Woman Entrepreneur', actual: `Your category: ${userCat}` })
      }
    } else {
      matchedRules.push('Category criteria met')
    }

    // Rule 2: Income Limit
    if (['nsfdc-term-loan', 'micro-finance-scheme', 'NSFDC-TERM-01', 'NSFDC-MICRO-02'].includes(scheme.id)) {
      if (userIncome > 0 && userIncome <= 300000) {
        matchedRules.push('Annual income within ₹3.00 Lakh ceiling')
      } else if (userIncome > 300000) {
        failedRules.push({ rule: 'Income ceiling', required: '≤ ₹3.00 Lakh', actual: `Your income: ₹${(userIncome/100000).toFixed(2)} Lakh` })
      }
    } else if (scheme.id === 'standup-india' || scheme.id === 'STANDUP-IND-03') {
      if (userProjectCost >= 1000000) {
        matchedRules.push('Minimum project size (≥ ₹10L) met')
      } else if (userProjectCost > 0) {
        failedRules.push({ rule: 'Minimum Project Cost', required: '≥ ₹10.00 Lakh', actual: `Your project cost: ₹${(userProjectCost/100000).toFixed(2)} Lakh` })
      }
    }

    // Rule 3: Age check
    if (userAge) {
      if (userAge >= 18 && userAge <= 50) {
        matchedRules.push(`Age ${userAge} satisfies 18-50 years limit`)
      } else {
        failedRules.push({ rule: 'Age limit', required: '18 - 50 years', actual: `Your age: ${userAge}` })
      }
    }

    const isEligible = failedRules.length === 0

    return {
      ...scheme,
      eligible: isEligible,
      matchedRules: matchedRules.length > 0 ? matchedRules : ['General Scheme Guidelines Met'],
      failedRules,
    }
  })
}

const useChatStore = create((set, get) => ({
  // ── State ────────────────────────────────────────────────────────────────
  activeTab: savedSession.userProfile.isAuthenticated
    ? (savedSession.userProfile.role === 'admin' ? 'admin' : 'dashboard')
    : 'auth',
  sidebarOpen: false,
  language: 'English',

  // Admin Dashboard State
  adminTab: 'scraper',

  messages: [],
  beneficiaryId: savedSession.beneficiaryId,
  isLoading: false,

  userProfile: savedSession.userProfile,
  rawBackendSchemes: null,
  schemes: evaluateSchemesForProfile(savedSession.userProfile),
  selectedScheme: SAMPLE_SCHEMES[0],
  partners: SAMPLE_PARTNERS,
  selectedPartner: SAMPLE_PARTNERS[0],
  documents: SAMPLE_DOCUMENTS,
  activeApplication: INITIAL_APPLICATION,

  // OCR state for verification step
  ocrState: {
    isProcessing: false,
    file: null,
    extractedText: '',
    extractedData: null,
    step: 'idle',
  },

  // Calculator Parameters
  calculatorInput: {
    loanAmount: 450000,
    interestRate: 6.0,
    tenureYears: 5,
    moratoriumMonths: 6,
    ownContribution: 50000,
  },

  // ── Navigation & System Actions ───────────────────────────────────────────
  setActiveTab: (tab) => {
    const isAuth = get().userProfile?.isAuthenticated
    const targetTab = isAuth ? tab : 'auth'
    set({ activeTab: targetTab, sidebarOpen: false })
  },
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  setLanguage: (lang) => set({ language: lang }),
  setAdminTab: (tab) => set({ adminTab: tab }),
  setSelectedScheme: (scheme) => set({ selectedScheme: scheme }),
  setSelectedPartner: (partner) => set({ selectedPartner: partner }),

  fetchSchemesFromBackend: async () => {
    try {
      const res = await fetch(`${API_BASE}/schemes`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const mappedSchemes = data.map((s) => ({
            id: s.scheme_id,
            name: s.name,
            ministry: s.ministry || 'Ministry of Social Justice and Empowerment',
            purpose: `Financial loan scheme for ${s.category_eligibility ? s.category_eligibility.join(', ').toUpperCase() : 'eligible'} beneficiaries`,
            targetBeneficiaries: `Target categories: ${s.category_eligibility ? s.category_eligibility.join(', ').toUpperCase() : 'SC/ST'} with income limit ₹${((s.income_ceiling || 300000) / 100000).toFixed(2)} Lakh`,
            maxLoan: s.loan_limit || 500000,
            maxLoanText: `Up to ₹${((s.loan_limit || 500000) / 100000).toFixed(2)} Lakh`,
            interestRate: s.interest_rate_range ? `${s.interest_rate_range.min || 6}% p.a.` : '6% p.a.',
            moratorium: s.moratorium_months ? `${s.moratorium_months} Months` : '6 Months',
            repaymentPeriod: s.tenure_months ? `${Math.round(s.tenure_months / 12)} Years` : '5 Years',
            subsidy: s.subsidy_pct ? `${s.subsidy_pct}% Margin Money Subsidy` : 'Interest Concession',
            documentsNeeded: s.required_documents || ['Aadhaar', 'Caste Certificate', 'Income Certificate'],
          }))
          set({
            rawBackendSchemes: mappedSchemes,
            schemes: evaluateSchemesForProfile(get().userProfile, mappedSchemes),
            selectedScheme: mappedSchemes[0] || SAMPLE_SCHEMES[0],
          })
        }
      }
    } catch (e) {
      console.error('Failed to fetch schemes from backend:', e)
    }
  },

  updateProfile: async (updatedFields) => {
    const currentProfile = get().userProfile
    const bId = get().beneficiaryId
    const newProfile = { ...currentProfile, ...updatedFields }

    const activeSchemes = get().rawBackendSchemes || SAMPLE_SCHEMES
    set({
      userProfile: newProfile,
      schemes: evaluateSchemesForProfile(newProfile, activeSchemes),
    })
    localStorage.setItem('schemesetu_user', JSON.stringify(newProfile))

    // Sync updates to MongoDB backend
    if (bId && currentProfile.isAuthenticated) {
      try {
        await fetch(`${API_BASE}/auth/profile/${bId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: newProfile.name,
            phone_number: newProfile.phone,
            category: newProfile.category,
            state: newProfile.state,
            district: newProfile.district,
            pin_code: newProfile.pinCode,
            age: newProfile.age ? Number(newProfile.age) : null,
            gender: newProfile.gender,
            annual_income: newProfile.income ? Number(newProfile.income) : null,
            occupation: newProfile.occupation,
            business_type: newProfile.businessType,
            project_cost: newProfile.projectCost ? Number(newProfile.projectCost) : null,
            loan_required: newProfile.loanRequirement ? Number(newProfile.loanRequirement) : null,
          }),
        })
      } catch (e) {
        console.error('Failed to sync profile edit to MongoDB:', e)
      }
    }
  },

  logoutUser: () => {
    localStorage.removeItem('schemesetu_user')
    localStorage.removeItem('schemesetu_beneficiary_id')
    set({
      userProfile: INITIAL_PROFILE,
      schemes: evaluateSchemesForProfile(INITIAL_PROFILE),
      activeTab: 'auth',
      sidebarOpen: false,
      messages: [],
      beneficiaryId: `user-${Date.now()}`,
    })
  },

  // ── Auth Actions ──────────────────────────────────────────────────────────
  loginUser: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Login failed')
      }

      const data = await response.json()
      const u = data.user
      const userRole = u.role || 'beneficiary'
      const newProfile = {
        ...get().userProfile,
        name: u.full_name,
        email: u.email,
        phone: u.phone_number || '',
        category: u.category || 'SC',
        state: u.state || '',
        district: u.district || '',
        pinCode: u.pin_code || '',
        age: u.age || null,
        gender: u.gender || '',
        income: u.annual_income || 0,
        businessType: u.business_type || '',
        projectCost: u.project_cost || 0,
        loanRequirement: u.loan_required || 0,
        role: userRole,
        isAuthenticated: true,
        user_id: u.user_id,
      }

      const bId = u.user_id || `user-${Date.now()}`

      localStorage.setItem('schemesetu_user', JSON.stringify(newProfile))
      localStorage.setItem('schemesetu_beneficiary_id', bId)

      const activeSchemes = get().rawBackendSchemes || SAMPLE_SCHEMES
      set({
        userProfile: newProfile,
        schemes: evaluateSchemesForProfile(newProfile, activeSchemes),
        activeTab: userRole === 'admin' ? 'admin' : 'dashboard',
        beneficiaryId: bId,
      })

      get().fetchSchemesFromBackend()

      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  signupUser: async (signupData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Registration failed')
      }

      const data = await response.json()
      const u = data.user
      const userRole = u.role || 'beneficiary'
      const newProfile = {
        ...get().userProfile,
        name: u.full_name,
        email: u.email,
        phone: u.phone_number || '',
        category: u.category || 'SC',
        state: u.state || '',
        district: u.district || '',
        pinCode: u.pin_code || '',
        age: u.age || null,
        gender: u.gender || '',
        income: u.annual_income || 0,
        businessType: u.business_type || '',
        projectCost: u.project_cost || 0,
        loanRequirement: u.loan_required || 0,
        role: userRole,
        isAuthenticated: true,
        user_id: u.user_id,
      }

      const bId = u.user_id || `user-${Date.now()}`

      localStorage.setItem('schemesetu_user', JSON.stringify(newProfile))
      localStorage.setItem('schemesetu_beneficiary_id', bId)

      const activeSchemes = get().rawBackendSchemes || SAMPLE_SCHEMES
      set({
        userProfile: newProfile,
        schemes: evaluateSchemesForProfile(newProfile, activeSchemes),
        activeTab: userRole === 'admin' ? 'admin' : 'dashboard',
        beneficiaryId: bId,
      })

      get().fetchSchemesFromBackend()

      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },


  // ── Calculator Action ──────────────────────────────────────────────────────
  updateCalculatorInput: (fields) =>
    set((state) => ({
      calculatorInput: { ...state.calculatorInput, ...fields },
    })),

  // ── OCR & Document Action ──────────────────────────────────────────────────
  simulatePaddleOCRUpload: async (file) => {
    set({
      ocrState: {
        isProcessing: true,
        file,
        extractedText: '',
        extractedData: null,
        step: 'uploading',
      },
    })

    // Simulate PaddleOCR scanning latency
    await new Promise((res) => setTimeout(res, 1800))

    const isAadhaar = file.name.toLowerCase().includes('aadhaar') || file.name.toLowerCase().includes('id')
    const isIncome = file.name.toLowerCase().includes('income')

    const mockExtracted = isAadhaar
      ? {
          name: get().userProfile.name,
          aadhaarNo: 'XXXX-XXXX-9012',
          dob: '1998-05-14',
          gender: get().userProfile.gender,
          address: `${get().userProfile.district}, ${get().userProfile.state} - ${get().userProfile.pinCode}`,
        }
      : isIncome
      ? {
          name: get().userProfile.name,
          annualIncome: `₹${get().userProfile.income.toLocaleString('en-IN')}`,
          issuingDate: '2026-01-15',
          validUntil: '2027-03-31',
        }
      : {
          documentTitle: file.name,
          registrationNumber: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
          issueDate: '2025-11-20',
          verifiedName: get().userProfile.name,
        }

    set({
      ocrState: {
        isProcessing: false,
        file,
        extractedText: `[PaddleOCR Engine v2.7]: Recognized document "${file.name}" with 98.4% confidence.\nExtracted JSON profile attributes successfully.`,
        extractedData: mockExtracted,
        step: 'extracted',
      },
    })
  },

  confirmOcrData: (confirmedFields) => {
    const { ocrState, documents, userProfile } = get()
    if (!ocrState.file) return

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: ocrState.file.name,
      type: 'user_uploaded',
      status: 'verified',
      uploadDate: new Date().toISOString().split('T')[0],
      extractedData: confirmedFields || ocrState.extractedData,
    }

    set({
      documents: [newDoc, ...documents],
      userProfile: {
        ...userProfile,
        ...(confirmedFields?.annualIncome ? { income: parseInt(confirmedFields.annualIncome.replace(/[^0-9]/g, '')) } : {}),
      },
      ocrState: {
        isProcessing: false,
        file: null,
        extractedText: '',
        extractedData: null,
        step: 'confirmed',
      },
    })
  },

  resetOcrState: () =>
    set({
      ocrState: {
        isProcessing: false,
        file: null,
        extractedText: '',
        extractedData: null,
        step: 'idle',
      },
    }),

  // ── Chat Actions ──────────────────────────────────────────────────────────
  uploadDocument: async (file) => {
    if (!file) return

    const userMsg = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: `📄 Uploaded document: ${file.name}`,
      data: null,
    }

    set((state) => ({
      messages: [...state.messages, userMsg],
      isLoading: true,
    }))

    try {
      const formData = new FormData()
      formData.append('file', file)

      const ocrResponse = await fetch(
        `${API_BASE}/chat/${get().beneficiaryId}/document`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!ocrResponse.ok) {
        const errorText = await ocrResponse.text()
        throw new Error(`OCR processing failed (${ocrResponse.status}): ${errorText}`)
      }

      const ocrData = await ocrResponse.json()
      const extractedText = ocrData.extracted_text || ''

      if (!extractedText.trim()) {
        const systemNotice = {
          id: `msg-${Date.now()}-agent`,
          role: 'agent',
          content: `Processed document "${file.name}", but no readable text could be extracted by OCR.`,
          data: ocrData,
        }
        set((state) => ({
          messages: [...state.messages, systemNotice],
          isLoading: false,
        }))
        return
      }

      // Send extracted text into conversational intake pipeline for entity extraction & AI reply
      const chatResponse = await fetch(
        `${API_BASE}/chat/${get().beneficiaryId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `[Document Content from ${file.name}]: ${extractedText}` }),
        }
      )

      if (!chatResponse.ok) {
        const chatErrText = await chatResponse.text()
        throw new Error(`Chat intake failed (${chatResponse.status}): ${chatErrText}`)
      }

      const chatData = await chatResponse.json()

      const agentMsg = {
        id: `msg-${Date.now()}-agent`,
        role: 'agent',
        content: chatData.reply,
        data: chatData,
      }

      set((state) => ({
        messages: [...state.messages, agentMsg],
        isLoading: false,
      }))
    } catch (err) {
      const errMsg = {
        id: `msg-${Date.now()}-error`,
        role: 'system',
        content: `Document upload error: ${err.message}`,
        data: null,
      }

      set((state) => ({
        messages: [...state.messages, errMsg],
        isLoading: false,
      }))
    }
  },

  sendMessage: async (text) => {
    const userMsg = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      data: null,
    }

    set((state) => ({
      messages: [...state.messages, userMsg],
      isLoading: true,
    }))

    try {
      const response = await fetch(
        `${API_BASE}/chat/${get().beneficiaryId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        }
      )

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`Server error ${response.status}: ${errorBody}`)
      }

      const data = await response.json()

      const agentMsg = {
        id: `msg-${Date.now()}-agent`,
        role: 'agent',
        content: data.reply,
        data,
      }

      set((state) => ({
        messages: [...state.messages, agentMsg],
        isLoading: false,
      }))
    } catch (err) {
      const errMsg = {
        id: `msg-${Date.now()}-error`,
        role: 'system',
        content: `Server connection notice: ${err.message}`,
        data: null,
      }

      set((state) => ({
        messages: [...state.messages, errMsg],
        isLoading: false,
      }))
    }
  },
}))

export default useChatStore

