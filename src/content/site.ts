/**
 * All of the site's text and contact details live here.
 * Every [BRACKETED] value is a placeholder, and every `reviewed: false` marks
 * content that still needs the centre's sign-off.
 * Run `npm run check:launch` to list what is left before going live.
 */

export type Tone = "yellow" | "coral" | "mint" | "sky";

export const site = {
  name: "Awaaz Speech & Hearing Centre",
  tagline: "Speech, language & hearing",
  // The live domain, with https:// and no trailing slash. Used for SEO and the sitemap.
  url: "https://www.example.com",
  description:
    "Speech therapy, language support and hearing tests for children and adults — playful sessions, precise tests, and families involved every step of the way.",
  email: "aawazksp@yahoo.com",
  phone: {
    display: "+91 9897426673",
    // Full international number, used for tel: links.
    tel: "+919897426673",
  },
  whatsapp: {
    display: "+91 9897426673",
    // Country code + number, digits only, used for https://wa.me links.
    number: "919897426673",
    defaultMessage: "Hi, I'd like to book a visit.",
  },
  address: {
    street: "T - Point se Left side, Main Rd",
    area: "Old Awas Vikas",
    city: "Kashipur",
    state: "Uttarakhand",
    pin: "244713",
    country: "IN",
  },
  hours: [
    {
      label: "Mon–Sat",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      // 24-hour format, e.g. "09:30" and "18:00".
      opens: "09:00",
      closes: "18:00",
    },
    { label: "Sun", days: ["Sunday"], closed: true },
  ] as OpeningHours[],
  languages: "English, Hindi",
  google: {
    // Must start with https://www.google.com/maps/embed?pb= — on a computer, open
    // Google Maps → the listing → Share → "Embed a map" tab → Copy HTML, and paste
    // only the src="…" value. Share links (share.google, maps.app.goo.gl) can't be
    // embedded; until this is set, the site shows an "Open in Google Maps" card.
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3482.610789691856!2d78.96277557597233!3d29.205583657826075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390a43b0457185bd%3A0x5372e99fb96ff271!2sAawaz%20Speech%20And%20Hearing%20Centre!5e0!3m2!1sen!2sin!4v1794078582366!5m2!1sen!2sin",
    // Link to the centre's Google Business Profile (Maps listing).
    profileUrl: "https://maps.app.goo.gl/erRZaei4TZmkAMZv6",
    // Link that opens the centre's Google reviews.
    reviewsUrl: "",
  },
} as const;

type OpeningHours =
  | {
      label: string;
      days: string[];
      opens: string;
      closes: string;
      closed?: false;
    }
  | {
      label: string;
      days: string[];
      closed: true;
    };

export const fullAddress = [
  site.address.street,
  site.address.area,
  site.address.city,
  site.address.state,
  site.address.pin,
].join(", ");

export function formatHours(row: OpeningHours) {
  if (row.closed) return "Closed";

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "pm" : "am";
    const hour = hours % 12 || 12;
    return `${hour}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""} ${period}`;
  };

  return `${formatTime(row.opens)}–${formatTime(row.closes)}`;
}

export function whatsappLink(message: string = site.whatsapp.defaultMessage) {
  return `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

export const links = {
  call: `tel:${site.phone.tel}`,
  whatsapp: whatsappLink(),
  email: `mailto:${site.email}`,
  // Point this at an online booking page (Practo, Calendly, a form) if there is one.
  book: `tel:${site.phone.tel}`,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`,
};

export const navLinks = [
  { label: "Where to start", href: "/#start" },
  { label: "For parents", href: "/#milestones" },
  { label: "Services", href: "/services" },
  { label: "Adults", href: "/services#adults" },
  { label: "Contact", href: "/#contact" },
];

export const heroTags: { label: string; tone: Tone }[] = [
  { label: "Play-based sessions", tone: "yellow" },
  { label: "Parents in the room", tone: "mint" },
  { label: "Hearing tests from birth", tone: "coral" },
];

export const startTiles: { title: string; text: string; href: string; tone: Tone }[] = [
  {
    title: "My toddler isn't talking yet",
    text: "A late-talking and language assessment.",
    href: "/services/late-talking-language",
    tone: "yellow",
  },
  {
    title: "My child is hard to understand",
    text: "Speech sound assessment and therapy.",
    href: "/services/clear-speech",
    tone: "coral",
  },
  {
    title: "I'm worried about my child's hearing",
    text: "Newborn screening, OAE, BERA and play-based tests.",
    href: "/services/hearing-tests-children",
    tone: "mint",
  },
  {
    title: "It's for me or another adult",
    text: "Hearing tests, hearing aids, and therapy after stroke.",
    href: "/services#adults",
    tone: "sky",
  },
];

// Have the centre's speech-language pathologist review this wording before launch.
export const milestones: { age: string; text: string; tone: Tone }[] = [
  {
    age: "By 12 months",
    text: "Babbles (ba-ba, da-da), turns to sounds and their name, waves bye-bye.",
    tone: "yellow",
  },
  {
    age: "By 18 months",
    text: "Says several single words and points to show you things.",
    tone: "coral",
  },
  {
    age: "By 2 years",
    text: "Puts two words together — “more milk”, “daddy go”.",
    tone: "mint",
  },
  {
    age: "By 3 years",
    text: "Speaks in short sentences that family understands most of the time.",
    tone: "sky",
  },
];

export const sessionSteps: { title: string; text: string; tone: Tone }[] = [
  {
    title: "Play",
    text: "Games, toys and stories chosen around your child's goals — so practice feels like fun.",
    tone: "yellow",
  },
  {
    title: "Practice together",
    text: "You stay in the room and see exactly what works, so you can do it at home.",
    tone: "mint",
  },
  {
    title: "Take it home",
    text: "A short activity plan for the week, and a progress check every few sessions.",
    tone: "coral",
  },
];

export const centrePhotos = [
  "Play-based therapy room",
  "Child-friendly test booth",
  "Waiting area with toys",
];

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export type ServiceIcon = "speech" | "book" | "wave" | "people" | "ear" | "school" | "pulse" | "mic";
export type Audience = "children" | "adults";

export type Service = {
  slug: string;
  title: string;
  seoTitle: string;
  short: string;
  icon: ServiceIcon;
  tone: Tone;
  audience: Audience;
  intro: string;
  signs: string[];
  firstVisit: string;
  howWeHelp: string[];
  // Shown as a highlighted note, e.g. when to see a doctor urgently.
  note?: string;
};

// Service page wording: have the centre's audiologist and speech-language
// pathologist review it, then set this to true.
export const servicesReviewed = false;

export const services: Service[] = [
  {
    slug: "clear-speech",
    title: "Clear speech",
    seoTitle: "Speech sound therapy for children",
    short: "For children who are hard to understand or mix up sounds.",
    icon: "speech",
    tone: "yellow",
    audience: "children",
    intro:
      "Some children find certain sounds hard to say, so words come out unclear — “tat” for “cat”, or “wabbit” for “rabbit”. Many of these errors are a normal part of learning to talk, but some last longer than expected and are easier to fix with help.",
    signs: [
      "Family members often can't understand your child",
      "Your child gets frustrated when people don't understand them",
      "Sounds are left out or swapped for longer than expected for their age",
      "Teachers or other children comment on their speech",
    ],
    firstVisit:
      "The therapist listens to your child name pictures and chat during play, then works out which sounds are affected and why. You'll get a clear explanation and a plan.",
    howWeHelp: [
      "Short, play-based practice of the sounds your child needs",
      "Listening games to hear the difference between sounds",
      "Simple home activities so progress continues between sessions",
    ],
  },
  {
    slug: "late-talking-language",
    title: "Late talking & language",
    seoTitle: "Late talking and language delay in children",
    short: "Building first words, sentences and understanding.",
    icon: "book",
    tone: "mint",
    audience: "children",
    intro:
      "Some children say their first words later than others, or find it hard to understand what's said, follow instructions or put words together. Early support helps while these skills are still developing quickly.",
    signs: [
      "Few or no words by around 18 months",
      "Not joining two words together by around 2 years",
      "Difficulty understanding simple instructions",
      "Relies mostly on pointing or pulling you to show what they want",
    ],
    firstVisit:
      "We play with your child and talk with you about how they communicate at home, then assess how they understand and use language.",
    howWeHelp: [
      "Play-based therapy built around your child's interests",
      "Coaching for parents on everyday ways to build language",
      "Regular progress reviews against clear goals",
    ],
  },
  {
    slug: "stuttering",
    title: "Stuttering",
    seoTitle: "Stuttering therapy for children",
    short: "Smoother, more confident talking at home and school.",
    icon: "wave",
    tone: "coral",
    audience: "children",
    intro:
      "Stuttering is when the flow of speech is interrupted — repeating sounds or words, stretching sounds, or getting stuck. Many young children go through a period of bumpy speech; some need help to talk more smoothly and confidently.",
    signs: [
      "Repeating sounds or parts of words (“b-b-b-ball”)",
      "Stretching sounds (“sssssun”) or getting stuck with no sound coming out",
      "Tension, blinking or avoiding words while speaking",
      "Your child seems worried or embarrassed about talking",
    ],
    firstVisit:
      "We listen to your child talk in different situations and ask when the stuttering started and how it changes. Then we discuss whether to keep an eye on it or begin therapy.",
    howWeHelp: [
      "Therapy approaches suited to your child's age",
      "Practice that builds confidence in real situations, like school",
      "Guidance for parents on how to respond at home",
    ],
  },
  {
    slug: "autism-social-communication",
    title: "Autism & social communication",
    seoTitle: "Speech therapy for autism and social communication",
    short: "Communication support that fits the way your child learns.",
    icon: "people",
    tone: "sky",
    audience: "children",
    intro:
      "Children on the autism spectrum, and others with social communication differences, may communicate in their own way. Therapy helps your child express their needs, connect with others and take part in daily life — in a way that suits them.",
    signs: [
      "Rarely responds to their name or looks to share things with you",
      "Finds back-and-forth play or conversation hard",
      "Repeats words or phrases rather than using them to communicate",
      "Gets very frustrated when they can't get a message across",
    ],
    firstVisit:
      "We watch how your child communicates during play and talk with you about their strengths, interests and challenges. If your child has a diagnosis or reports, please bring them.",
    howWeHelp: [
      "Support for words, gestures, pictures or devices — whatever works for your child",
      "Goals that matter in your family's daily routines",
      "Working with schools and other professionals when helpful",
    ],
  },
  {
    slug: "hearing-tests-children",
    title: "Hearing tests for kids",
    seoTitle: "Hearing tests for babies and children",
    short: "From newborn screening (OAE, BERA) to play-based hearing tests.",
    icon: "ear",
    tone: "yellow",
    audience: "children",
    intro:
      "Hearing is the foundation for speech and language. We test hearing at any age — from newborn screening to play-based tests for toddlers and school-age children.",
    signs: [
      "Your baby doesn't startle at loud sounds or turn towards voices",
      "Speech is late or unclear",
      "Your child often says “what?” or wants the TV louder",
      "Frequent ear infections, or a family history of hearing loss",
    ],
    firstVisit:
      "Depending on your child's age, tests may include OAE and BERA for babies, or listening games for young children. The tests are painless, and we explain the results to you.",
    howWeHelp: [
      "Hearing tests suited to every age, from newborn to teenager",
      "A clear explanation of results and next steps",
      "Hearing aid fitting and follow-up if your child needs them",
    ],
  },
  {
    slug: "listening-learning",
    title: "Listening & learning",
    seoTitle: "Auditory processing and listening support for children",
    short: "Support for auditory processing and listening in the classroom.",
    icon: "school",
    tone: "mint",
    audience: "children",
    intro:
      "Some children pass a hearing test but still find it hard to make sense of what they hear — especially in noisy places like classrooms. This is sometimes called an auditory processing difficulty.",
    signs: [
      "Difficulty following instructions, especially when it's noisy",
      "Often mishears words or asks for things to be repeated",
      "Struggles with phonics, reading or spelling",
      "Seems to “tune out” in class",
    ],
    firstVisit:
      "We start by checking hearing, then use listening tests suited to your child's age. Detailed listening tests are usually done from around age 7.",
    howWeHelp: [
      "Listening and attention training",
      "Practical strategies for home and the classroom",
      "A written report you can share with your child's school",
    ],
  },
  {
    slug: "hearing-tests-hearing-aids",
    title: "Hearing tests & hearing aids",
    seoTitle: "Hearing tests and hearing aids for adults",
    short: "Find out exactly what you're missing, and get help choosing and fitting hearing aids.",
    icon: "ear",
    tone: "sky",
    audience: "adults",
    intro:
      "Hearing loss often comes on gradually, so family members may notice before you do. A hearing test shows exactly what you're missing, and today's hearing aids are small and easy to use.",
    signs: [
      "Often asking people to repeat themselves",
      "Finding conversations hard in noisy places",
      "Turning the TV up louder than others like",
      "Ringing in the ears, or a feeling of fullness",
    ],
    firstVisit:
      "We ask about your hearing and health, then run a hearing test in a quiet test room. We explain your results and, if needed, talk through hearing aid options and costs.",
    howWeHelp: [
      "A full hearing assessment, including audiometry and impedance",
      "Help choosing a hearing aid that suits your hearing and budget",
      "Fitting, fine-tuning and follow-up visits",
    ],
    note: "Sudden hearing loss in one or both ears needs urgent medical attention — see a doctor the same day.",
  },
  {
    slug: "tinnitus",
    title: "Tinnitus care",
    seoTitle: "Tinnitus assessment and management",
    short: "Assessment and a management plan for ringing or buzzing in the ears.",
    icon: "pulse",
    tone: "coral",
    audience: "adults",
    intro:
      "Tinnitus is hearing a sound — ringing, buzzing or hissing — that has no outside source. It's common and often linked to hearing loss. There's often no quick cure, but it can usually be made much less bothersome.",
    signs: [
      "Ringing, buzzing or hissing in one or both ears",
      "Trouble sleeping or concentrating because of the noise",
      "Tinnitus along with difficulty hearing",
    ],
    firstVisit:
      "We test your hearing and ask how tinnitus affects your daily life, then explain what may be causing it and what can help.",
    howWeHelp: [
      "A hearing assessment to look for an underlying cause",
      "Sound therapy and hearing aids where they help",
      "Practical strategies to reduce its impact on sleep and focus",
    ],
    note: "See a doctor promptly if tinnitus is in one ear only, beats in time with your pulse, or comes with dizziness or sudden hearing loss.",
  },
  {
    slug: "adult-speech-voice-swallowing",
    title: "Speech, voice & swallowing",
    seoTitle: "Speech, voice and swallowing therapy for adults",
    short: "Therapy after stroke or illness, for voice problems and swallowing difficulties.",
    icon: "mic",
    tone: "mint",
    audience: "adults",
    intro:
      "A stroke, brain injury or illness can affect how you speak, understand language or swallow. Voice problems can also come from overuse or other causes. Therapy helps you regain skills and confidence.",
    signs: [
      "Difficulty finding words or understanding speech after a stroke (aphasia)",
      "Slurred or unclear speech",
      "A hoarse, weak or strained voice",
      "Coughing or choking while eating or drinking",
    ],
    firstVisit:
      "We assess your speech, language, voice or swallowing and talk with you and your family about your goals. Please bring any hospital reports.",
    howWeHelp: [
      "Therapy for aphasia and speech clarity",
      "Voice therapy and advice on caring for your voice",
      "Swallowing assessment and strategies for safer eating and drinking",
    ],
    note: "A hoarse voice that lasts more than three weeks should also be checked by an ENT doctor.",
  },
];

export const childrenServices = services.filter((service) => service.audience === "children");
export const adultServices = services.filter((service) => service.audience === "adults");

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Team                                                                */
/* ------------------------------------------------------------------ */

export type SpecialistCertificate = {
  title: string;
  issuer: string;
  year: string;
  file: string;
};

export type Specialist = {
  slug: string;
  name: string;
  role: string;
  qualification: string;
  registration: string;
  photo: string;
  bio: string;
  experience: string;
  specializations: string[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  certificates: SpecialistCertificate[];
};

export const team: Specialist[] = [
  {
    slug: "pushpak-kumar",
    name: "Pushpak Kumar",
    role: "Audiologist & Speech Therapist",
    qualification: "Bachelor of Audiology and Speech-Language Pathology (BASLP)",
    registration: "A81403",
    photo: "",
    bio: "",
    experience: "",
    specializations: [],
    education: [],
    certificates: [],
  },
];


/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export const faq = {
  // Confirm every answer with the centre, then set this to true.
  reviewed: true,
  items: [
    {
      question: "How much does a visit cost?",
      answer:
        "Please call or WhatsApp us to discuss session costs, which vary depending on the treatment. For hearing aid prices, get in touch with us — they vary by model.",
    },
    {
      question: "How long is a session?",
      answer: "A first assessment takes about 30 minutes. Therapy sessions last 45 minutes.",
    },
    {
      question: "Do I need a doctor's referral?",
      answer:
        "No, you can book directly. If you have reports from a doctor, hospital or school, please bring them.",
    },
    {
      question: "What should we bring to the first visit?",
      answer:
        "Any previous reports and a list of current medicines. For children, a favourite toy or snack can help them settle in.",
    },
    {
      question: "Can parents stay during the session?",
      answer:
        "Yes, and we encourage it. Seeing what works in the session helps you continue the practice at home.",
    },
    {
      question: "How many sessions will my child need?",
      answer:
        "It depends on your child and their goals. After the assessment we'll give you an honest estimate and review progress with you regularly.",
    },
    {
      question: "Which languages do you offer sessions in?",
      answer: "We offer sessions in Hindi & English.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Milestone checklist                                                 */
/* ------------------------------------------------------------------ */

export const checklist = {
  // Questions are drafted from widely used developmental milestone guides.
  // The centre's speech-language pathologist must review them, then set this
  // to true; until then the page shows a "draft" notice.
  reviewed: true,
  bands: [
    {
      id: "12m",
      label: "Around 12 months",
      questions: [
        "Does your child turn to look when you say their name?",
        "Does your child babble with sounds like “ba-ba” or “da-da”?",
        "Does your child wave bye-bye or use other simple gestures?",
        "Does your child understand “no” — pausing or stopping when you say it?",
      ],
    },
    {
      id: "18m",
      label: "Around 18 months",
      questions: [
        "Does your child try to say three or more words besides “mama” or “dada”?",
        "Does your child point to show you something interesting?",
        "Does your child follow a simple instruction without you pointing, like “give it to me”?",
        "Does your child look at a familiar object when you name it?",
      ],
    },
    {
      id: "2y",
      label: "Around 2 years",
      questions: [
        "Does your child say at least two words together, like “more milk”?",
        "Does your child point to things in a book when you ask, like “where's the dog?”",
        "Does your child point to at least two body parts when asked?",
        "Does your child use gestures beyond waving and pointing, like blowing a kiss or nodding yes?",
      ],
    },
    {
      id: "3y",
      label: "Around 3 years",
      questions: [
        "Does your child talk with you in a conversation, going back and forth at least twice?",
        "Does your child ask “who”, “what”, “where” or “why” questions?",
        "Can your child say their first name when asked?",
        "Can people who know your child understand their speech most of the time?",
      ],
    },
  ],
};
