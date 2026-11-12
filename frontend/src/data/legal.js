// Legal and informational page content. CONFIG_PLACEHOLDER marks missing
// business info that must be filled before publishing.
export const CONTACT_EMAIL = "support@mycrushpdf.com";
export const SITE_NAME = "mycrushpdf";
export const SITE_URL = "https://mycrushpdf.web.app";

// Placeholders — replace before going live. Do NOT invent these values.
export const BUSINESS = {
  legalName: "[CONFIG: Legal entity name]",
  address: "[CONFIG: Registered office address]",
  phone: "[CONFIG: Contact phone number]",
  jurisdiction: "India",
};

export const LEGAL_PAGES = {
  "about-us": {
    title: "About Us",
    seoTitle: "About mycrushpdf — Free Online PDF Tools",
    seoDescription:
      "Learn about mycrushpdf, a free online platform offering fast, secure PDF tools to merge, compress, split, convert and organize documents.",
    updated: "2026-01-10",
    sections: [
      { h: null, p: ["mycrushpdf is a free online platform that helps people work with PDF documents quickly and securely. We build simple, reliable tools to merge, compress, split, convert, rotate and organize PDFs — no software installation and no account required for everyday use."] },
      { h: "Our mission", p: ["Document tasks should be simple. Our mission is to offer professional-grade PDF utilities that anyone can use from any device, with a clean interface and honest, transparent handling of files."] },
      { h: "How we work", p: ["Our PDF tools run entirely in your web browser using trusted open-source libraries (pdf-lib, PDF.js and JSZip). Your files are read and processed on your own device and are not uploaded to our servers. When you close or refresh the page, the files and results are gone from the page memory."] },
      { h: "What we value", p: ["Speed, privacy and clarity. We avoid dark patterns, misleading buttons and intrusive popups. Tools do exactly what they say, and our content explains clearly what each tool can and cannot do."] },
      { h: "Contact", p: [`Questions or feedback? Reach us any time at ${CONTACT_EMAIL} or through our Contact page.`] },
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    seoTitle: "Privacy Policy — mycrushpdf",
    seoDescription:
      "How mycrushpdf collects, uses and protects data, including file processing, cookies, analytics, advertising and your rights under the DPDP Act.",
    updated: "2026-01-20",
    sections: [
      { h: null, p: [`This Privacy Policy explains how ${SITE_NAME} ("we", "us") handles information when you use our website and tools. By using the site you agree to the practices described here.`] },
      { h: "Information we collect", p: [
        "Files you select: documents and images you choose in a tool are processed in your browser and are not sent to us.",
        "Technical data: IP address, browser type, device information, and usage events collected via logs and analytics to keep the service secure and improve it.",
        "Contact data: the name, email and message you provide when you contact us.",
      ] },
      { h: "How your files are processed", p: [
        "The Merge, Compress, Split, Remove Pages, Organize, Rotate and JPG to PDF tools process files locally in your browser. The files you select are not uploaded to our servers.",
        "The finished file is created in your browser's memory and saved to your device when you click Download. It is released when you leave or refresh the page.",
        "Our servers may receive an anonymous usage event (the tool name and whether processing succeeded) to count tool usage. It does not include file names or file contents.",
        "We do not see, store or analyze the contents of your documents.",
      ] },
      { h: "Cookies", p: ["We use essential cookies for security and, for administrators, authentication. We may use cookies to remember preferences and, in the future, to support analytics and advertising as described below. See our Cookie Policy for details."] },
      { h: "Analytics", p: ["We may use privacy-respecting analytics to understand aggregate usage, such as which tools are popular and where errors occur. Analytics data is aggregated and not used to identify you personally."] },
      { h: "Google advertising and third-party providers", p: [
        "We are preparing the site for advertising and have not enabled ads yet. When enabled, we may use Google AdSense and third-party advertising providers.",
        "Third-party vendors, including Google, use cookies to serve ads based on prior visits to this and other websites.",
        "You can learn how Google uses information from sites that use its services at https://policies.google.com/technologies/partner-sites.",
        "For users in the EEA, UK and Switzerland, we will present a Google-certified consent management platform (CMP) to collect advertising and cookie consent before non-essential cookies are set.",
      ] },
      { h: "IP addresses and identifiers", p: ["We process IP addresses and similar identifiers for security, rate limiting and abuse prevention. Advertising and analytics providers may process identifiers subject to your consent where required."] },
      { h: "Data sharing", p: ["We share data only with service providers that help us operate the site (such as hosting and, in future, analytics and advertising), and where required by law. We do not sell your personal data."] },
      { h: "Third-party service providers", p: ["Our infrastructure may include cloud hosting and content delivery providers. These providers process data on our behalf under their own security and privacy commitments."] },
      { h: "Your rights (including DPDP, India)", p: [
        "Depending on your location, you may have rights to access, correct, update or delete your personal data, and to withdraw consent.",
        "For users in India, we aim to comply with the Digital Personal Data Protection Act, 2023 (DPDP), including processing personal data for lawful purposes, honoring consent, and responding to data principal requests.",
        `To exercise any right, contact us at ${CONTACT_EMAIL}.`,
      ] },
      { h: "Children", p: ["Our tools are intended for general audiences and not directed at children. We do not knowingly collect personal data from children."] },
      { h: "Policy updates", p: ["We may update this policy to reflect changes in our practices or the law. Material changes will be posted on this page with a new last-updated date."] },
      { h: "Contact", p: [`For privacy questions or requests, email ${CONTACT_EMAIL}.`] },
    ],
  },
  "terms-and-conditions": {
    title: "Terms and Conditions",
    seoTitle: "Terms and Conditions — mycrushpdf",
    seoDescription:
      "The terms governing your use of mycrushpdf's free online PDF tools, including acceptable use, disclaimers and limitations of liability.",
    updated: "2026-01-20",
    sections: [
      { h: null, p: [`These Terms and Conditions govern your use of ${SITE_NAME}. By accessing or using the site you agree to these terms.`] },
      { h: "Use of the service", p: ["You may use our tools for lawful purposes only. You are responsible for the files you upload and must have the right to process them."] },
      { h: "Acceptable use", p: [
        "Do not upload illegal, infringing or malicious content.",
        "Do not attempt to disrupt, overload or reverse-engineer the service.",
        "Do not use automated means to abuse the tools beyond reasonable rate limits.",
      ] },
      { h: "No warranty", p: ["The service is provided \"as is\" without warranties of any kind. We do not guarantee that processing will be error-free or that results will meet your specific needs."] },
      { h: "Limitation of liability", p: ["To the maximum extent permitted by law, we are not liable for any indirect, incidental or consequential damages, or for any loss of data arising from use of the service. Always keep a copy of your original files."] },
      { h: "Intellectual property", p: ["The mycrushpdf name, branding and site content are owned by us. You retain all rights to your own documents."] },
      { h: "Changes", p: ["We may update these terms from time to time. Continued use after changes constitutes acceptance of the updated terms."] },
      { h: "Contact", p: [`Questions about these terms? Email ${CONTACT_EMAIL}.`] },
    ],
  },
  "cookie-policy": {
    title: "Cookie Policy",
    seoTitle: "Cookie Policy — mycrushpdf",
    seoDescription:
      "How mycrushpdf uses cookies, including essential, preference, analytics and advertising cookies, and how to manage your consent.",
    updated: "2026-01-20",
    sections: [
      { h: null, p: ["This Cookie Policy explains what cookies are, how we use them, and your choices."] },
      { h: "What are cookies", p: ["Cookies are small text files stored on your device. They help websites function, remember preferences and measure usage."] },
      { h: "Types of cookies we use", p: [
        "Essential cookies: required for security and administrator authentication. These cannot be switched off.",
        "Preference cookies: remember choices such as selected options.",
        "Analytics cookies: help us understand aggregate usage (used only where permitted).",
        "Advertising cookies: not active yet. When advertising is enabled, Google and third-party partners may set cookies to serve and measure ads.",
      ] },
      { h: "Managing cookies", p: [
        "You can control cookies through your browser settings.",
        "For users in the EEA, UK and Switzerland, we will present a Google-certified consent management platform to manage advertising and analytics consent.",
        "Learn more about Google's use of data at https://policies.google.com/technologies/partner-sites.",
      ] },
      { h: "Updates", p: ["We may update this policy as our cookie use changes. Check back for the latest version."] },
    ],
  },
  "disclaimer": {
    title: "Disclaimer",
    seoTitle: "Disclaimer — mycrushpdf",
    seoDescription:
      "Important disclaimers about the use of mycrushpdf's online PDF tools, accuracy of results and third-party links.",
    updated: "2026-01-20",
    sections: [
      { h: null, p: [`The information and tools provided by ${SITE_NAME} are offered in good faith and for general use.`] },
      { h: "Results and accuracy", p: ["We strive for reliable processing, but we do not guarantee that every file will convert or process perfectly. Complex or unusual documents may produce imperfect results. Always review output before relying on it."] },
      { h: "Not professional advice", p: ["Our blog and guides are for general information only and do not constitute legal, financial or professional advice."] },
      { h: "Security", p: ["Our PDF tools process files in your browser, so your documents are not uploaded to our servers. However, no website can promise absolute security, for example if your own device or browser is compromised. Keep backups of your original files."] },
      { h: "External links", p: ["Our site may link to third-party websites. We are not responsible for their content or practices."] },
    ],
  },
  "security": {
    title: "Security & File Privacy",
    seoTitle: "Security & File Privacy — How mycrushpdf Handles Your Files",
    seoDescription:
      "How mycrushpdf processes PDF files in your browser, what data reaches our servers, file limits and practical tips for handling sensitive documents.",
    updated: "2026-06-15",
    sections: [
      { h: "Your files stay on your device", p: ["Merge, Compress, Split, Remove Pages, Organize, Rotate and JPG to PDF run inside your web browser using open-source libraries (pdf-lib, PDF.js and JSZip). Your files are processed on your own device and are not uploaded to our servers."] },
      { h: "What reaches our servers", p: [
        "The website itself (HTML, scripts, styles and images) is delivered over HTTPS.",
        "An optional anonymous usage event records the tool name and whether processing succeeded. It never includes file names or file contents.",
        "If you send a message through the Contact page, we receive the name, email and message you enter.",
      ] },
      { h: "Validation and limits", p: ["Files are checked before processing. PDFs must start with a valid PDF signature and images must be real JPG or PNG files. Each file can be up to 10 MB, PDFs up to 500 pages, and JPG to PDF accepts up to 20 images per batch. Password-protected PDFs are rejected with a clear message."] },
      { h: "When you are done", p: ["Results are created in your browser's memory and saved only when you click Download. Closing or refreshing the tab releases them."] },
      { h: "Tips for sensitive documents", p: ["Use an up-to-date browser, avoid shared or public computers for confidential files, and keep a backup of your original documents."] },
      { h: "Report a problem", p: [`If you believe you have found a security issue, email ${CONTACT_EMAIL}.`] },
    ],
  },
  "help": {
    title: "Help Center",
    seoTitle: "Help Center — mycrushpdf",
    seoDescription:
      "Get help using mycrushpdf's PDF tools, understand file limits and privacy, and learn how to troubleshoot common issues.",
    updated: "2026-01-20",
    sections: [
      { h: "Getting started", p: ["Pick a tool from the homepage or the All Tools page, upload your file, set any options, and download the result. No account is needed for everyday use."] },
      { h: "File limits", p: ["Each file can be up to 10 MB and 500 pages. JPG to PDF accepts up to 20 JPG or PNG images per batch. Password-protected PDFs must be unlocked before processing."] },
      { h: "Downloads", p: ["After processing, click Download to save the result to your device. The result only lives in your open browser tab, so download it before leaving or refreshing the page."] },
      { h: "Troubleshooting", p: [
        "If a file is rejected, confirm it is a valid, unlocked PDF or a supported image.",
        "If processing times out, try a smaller or less complex file.",
        "Still stuck? Contact us and describe what you were trying to do.",
      ] },
      { h: "Contact", p: [`For anything else, email ${CONTACT_EMAIL} or use the Contact page.`] },
    ],
  },
};
