export type DemoLead = {
    name: string;
    address: string;
    phone: string | null;
    email: string | null;
    website: string | null;
    city: string;
    state: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
    category: string;
    source: string;
  };
  
  const demoLeads: DemoLead[] = [
    {
      name: "MCD Primary School Block- A",
      address:
        "A block Ph-2 Metro Vihar, G-3 & G-4 Narela, Holambi Kalan, Delhi, 110082, India",
      phone: "+91 81305 41258",
      email: null,
      website: null,
      city: "Delhi",
      state: "Delhi",
      country: "IN",
      latitude: 28.8117728,
      longitude: 77.093413,
      category: "Primary school",
      source: "Demo Mode — Sample Data",
    },
    {
      name: "Indian Public School",
      address:
        "No -8, Main, Safiabad Rd, Gautam Colony, Narela, New Delhi, Delhi, 110040, India",
      phone: "+91 88609 80913",
      email: null,
      website: null,
      city: "New Delhi, Delhi",
      state: "Delhi",
      country: "IN",
      latitude: 28.8589274,
      longitude: 77.0873103,
      category: "General education school",
      source: "Demo Mode — Sample Data",
    },
    {
      name: "Gyanodaya Model Public School",
      address: "Q4WM+9J6, Alipur Village, Delhi, 110036, India",
      phone: "+91 93127 92098",
      email: null,
      website: "https://techinnovatemobility.com/",
      city: "Delhi",
      state: "Delhi",
      country: "IN",
      latitude: 28.7959034,
      longitude: 77.1340119,
      category: "General education school",
      source: "Demo Mode — Sample Data",
    },
    {
      name: "KM School",
      address:
        "Khasra No. 334/2, near HMR Institute, Hamidpur Village, Delhi, 110036, India",
      phone: "+91 96543 34611",
      email: null,
      website: null,
      city: "Delhi",
      state: "Delhi",
      country: "IN",
      latitude: 28.824655,
      longitude: 77.1514568,
      category: "General education school",
      source: "Demo Mode — Sample Data",
    },
    {
      name: "Geetanjali Public School",
      address: "811, Dulia Colony, Alipur Village, Delhi, 110036, India",
      phone: "+91 11 2720 3585",
      email: null,
      website: null,
      city: "Delhi",
      state: "Delhi",
      country: "IN",
      latitude: 28.8013766,
      longitude: 77.1306718,
      category: "Public educational institution",
      source: "Demo Mode — Sample Data",
    },
    {
      name: "Manava Bhawna Public School",
      address:
        "Budh Bazar, Nathu Pura, Burari, New Delhi, Delhi, 110084, India",
      phone: "+91 11 2773 1003",
      email: "info@iimmieducation.com",
      website: "http://www.mbpsdelhi.in/",
      city: "New Delhi, Delhi",
      state: "Delhi",
      country: "IN",
      latitude: 28.7691638,
      longitude: 77.1731826,
      category: "General education school",
      source: "Demo Mode — Sample Data",
    },
    {
      name: "ST.OMINA PUBLIC SCHOOL",
      address:
        "plot no 74,75 H block gate no 2, Gate no 1,2,3, DDA COLONY BAWANA, Delhi, 110039, India",
      phone: "+91 84474 41469",
      email: null,
      website: null,
      city: "Delhi",
      state: "Delhi",
      country: "IN",
      latitude: 28.8031611,
      longitude: 77.0525755,
      category: "General education school",
      source: "Demo Mode — Sample Data",
    },
    {
      name: "Mata Sukhdevi Public School",
      address: "National Highway 1, Nangli Puna, Delhi, 110036, India",
      phone: "+91 11 2720 4129",
      email: "info@matasukhdevischool.com",
      website: "https://www.matasukhdevischool.com/",
      city: "Delhi",
      state: "Delhi",
      country: "IN",
      latitude: 28.7756127,
      longitude: 77.1421397,
      category: "General education school",
      source: "Demo Mode — Sample Data",
    },
    {
      name: "Apna Bachpan School",
      address: "Singhola, Delhi, 110040, India",
      phone: "+91 70151 52088",
      email: null,
      website: "https://www.facebook.com/apnabachpan07",
      city: "Delhi",
      state: "Delhi",
      country: "IN",
      latitude: 28.8427753,
      longitude: 77.1243943,
      category: "School",
      source: "Demo Mode — Sample Data",
    },
    {
      name: "KRISHNA PUBLIC SCHOOL",
      address:
        "166 V.P.O, Mukhmelpur Village, New Delhi, Delhi, 110036, India",
      phone: "+91 98993 39877",
      email: null,
      website: "http://krishnapublicschool.org/",
      city: "New Delhi, Delhi",
      state: "Delhi",
      country: "IN",
      latitude: 28.7930542,
      longitude: 77.1632018,
      category: "General education school",
      source: "Demo Mode — Sample Data",
    },
  ];
  
  export function getDemoLeads(limit: number) {
    return demoLeads.slice(0, Math.min(limit, demoLeads.length));
  }