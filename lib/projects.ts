export type Project = {
  // Basic information
  title: string;
  slug: string;
  description: string;
  year: number;
  category: string;

  // Links
  live: string;
  source: string;

  // Visuals
  image: string;
  gallery: string[];

  // Technology
  tech: string[];

  // Case study
  overview: string;

  features: {
    title: string;
    description: string;
  }[];

  technicalHighlights: {
    title: string;
    description: string;
  }[];

  challenges: {
    title: string;
    description: string;
  }[];

  // Additional information
  role?: string;
  status?: string;
};

export const projects: Project[] = [
  {
    title: "Noir Media Studio",
    slug: "noir-media-studio",

    description:
      "A modern creative agency website designed to showcase the studio's work, services, and visual identity through an immersive digital experience.",

    year: 2026,
    category: "Agency Website",

    live: "https://noirmediastudio.org",
    source: "https://noirmediastudio.org",

    image: "/projects/noir/hero.avif",

    gallery: [
      "/projects/noir/introduction.avif",
      "/projects/noir/introduction2.avif",
      "/projects/noir/contact.avif",
    ],

    tech: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
    ],

    role: "Fullstack Developer",
    status: "Completed",

    overview:
      "Noir Media Studio is a creative agency website built to establish a strong visual identity while clearly communicating the studio's services and previous work. The experience combines minimal typography, smooth motion, and interactive elements to create a distinctive digital presence.",

    features: [
      {
        title: "Immersive Hero",
        description:
          "A visually focused hero section combining large typography, motion, and an interactive WebGL background to immediately establish the studio's identity.",
      },
      {
        title: "Project Showcase",
        description:
          "A structured project presentation that allows visitors to explore the studio's previous work through large visual previews and smooth transitions.",
      },
      {
        title: "Responsive Experience",
        description:
          "The interface was designed to maintain the same visual hierarchy and interactions across desktop, tablet, and mobile screen sizes.",
      },
      {
        title: "Contact Experience",
        description:
          "A focused contact section makes it easy for potential clients to get in touch while maintaining the visual language of the rest of the website.",
      },
    ],

    technicalHighlights: [
      {
        title: "Component Architecture",
        description:
          "Built the interface using reusable React components and structured sections so the website can be easily maintained and extended.",
      },
      {
        title: "WebGL Integration",
        description:
          "Integrated Three.js-based interactive elements into the experience while keeping the main content independent from the WebGL layer.",
      },
      {
        title: "Motion Design",
        description:
          "Used Framer Motion to create smooth transitions and scroll-based interactions without overwhelming the primary content.",
      },
      {
        title: "Responsive Design",
        description:
          "Created responsive layouts that preserve typography, spacing, and interaction patterns across different viewport sizes.",
      },
    ],

    challenges: [
      {
        title: "Balancing Motion and Usability",
        description:
          "The main challenge was creating an immersive experience without allowing animations to distract visitors from the agency's content and projects.",
      },
      {
        title: "Performance",
        description:
          "Interactive WebGL elements needed to remain visually rich while keeping the rest of the page responsive and performant.",
      },
      {
        title: "Responsive Layout",
        description:
          "Large typography and interactive elements required separate layout considerations for smaller screens.",
      },
    ],
  },

  {
    title: "Shopverse",
    slug: "shopverse",

    description:
      "A fullstack e-commerce platform for browsing products, managing inventory, and creating a modern online shopping experience.",

    year: 2026,
    category: "E-Commerce",

    source: "https://github.com/Sadab-Kibria/shopverse",
    live: "https://shopverseee.vercel.app/",

    image: "/projects/shopverse/hero.avif",

    gallery: [
      "/projects/shopverse/catalog.avif",
      "/projects/shopverse/productlist.avif",
      "/projects/shopverse/purchase1.avif",
      "/projects/shopverse/purchase2.avif",
      "/projects/shopverse/purchase3.avif",
      "/projects/shopverse/ai.avif",
      "/projects/shopverse/login.avif",
    ],

    tech: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Drizzle ORM",
      "PostgreSQL",
      "Neon",
    ],

    role: "Fullstack Developer",
    status: "Completed",

    overview:
      "Shopverse is a fullstack e-commerce application designed around a clean product discovery and purchasing experience. The project focuses on building the frontend and backend together, including product management, database integration, and responsive UI.",

    features: [
      {
        title: "Product Discovery",
        description:
          "Users can browse products through categories and organized product listings.",
      },
      {
        title: "Product Details",
        description:
          "Each product has a dedicated page containing detailed information, pricing, stock availability, and purchasing actions.",
      },
      {
        title: "Shopping Cart",
        description:
          "Users can add products to their cart and manage quantities before proceeding with their purchase.",
      },
    ],

    technicalHighlights: [
      {
        title: "Database Architecture",
        description:
          "Designed a PostgreSQL database for storing products, categories, stock information, and related application data.",
      },
      {
        title: "Drizzle ORM",
        description:
          "Used Drizzle ORM to provide type-safe database queries and maintain a clear database schema.",
      },
      {
        title: "Fullstack Next.js",
        description:
          "Used Next.js to handle both the frontend experience and server-side application logic.",
      },
    ],

    challenges: [
      {
        title: "Database Design",
        description:
          "Structuring product and category data required careful consideration of relationships and future scalability.",
      },
      {
        title: "State Management",
        description:
          "The shopping experience required consistent cart state across product pages and the rest of the application.",
      },
    ],
  },

  {
    title: "ImageKit",
    slug: "imagekit",

    description:
      "A privacy-first browser-based image toolkit for enhancing, converting, cropping, resizing, and AI upscaling images without uploading them to a server.",

    year: 2026,
    category: "Image Utility",

    live: "https://imagekit-six.vercel.app/",
    source: "https://github.com/Sadab-Kibria/ImageKit",

    image: "/projects/imagekit/homepage.avif",

    gallery: [
      "/projects/imagekit/enhancer.avif",
      "/projects/imagekit/converter.avif",
      "/projects/imagekit/cropper.avif",
      "/projects/imagekit/resizer.avif",
    ],

    tech: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Canvas API",
      "Web APIs",
      "ONNX Runtime Web",
      "Real-ESRGAN",
      "WebGPU",
    ],

    role: "Fullstack Developer",
    status: "Completed",

    overview:
      "ImageKit is a privacy-focused image processing platform designed to provide common image utilities directly inside the browser. Instead of uploading images to a backend server, ImageKit performs image manipulation locally using browser APIs and client-side processing. The platform includes image enhancement, format conversion, cropping, resizing, and AI-powered image upscaling using Real-ESRGAN.",

    features: [
      {
        title: "Image Enhancement",
        description:
          "Users can adjust brightness, contrast, saturation, sharpness, and other image properties while previewing the changes before downloading the final result.",
      },
      {
        title: "AI Image Upscaling",
        description:
          "Integrated Real-ESRGAN to provide AI-powered 2x and 4x image enhancement directly in the browser without sending images to an external processing service.",
      },
      {
        title: "Image Converter",
        description:
          "Converts images between common formats including JPG, JPEG, PNG, WebP, and AVIF while providing control over output quality where supported.",
      },
      {
        title: "Image Cropper",
        description:
          "Provides free-form and preset cropping with support for aspect ratios, rotation, horizontal and vertical flipping, and interactive crop positioning.",
      },
      {
        title: "Image Resizer",
        description:
          "Allows users to resize images by width and height, percentage, or predefined dimensions while maintaining the original aspect ratio when required.",
      },
      {
        title: "Before / After Comparison",
        description:
          "An interactive comparison slider allows users to visually compare the original image with the processed result.",
      },
      {
        title: "Browser-Based Processing",
        description:
          "Image processing happens locally in the browser, allowing users to work with their images without uploading them to a remote server.",
      },
      {
        title: "AI Usage Protection",
        description:
          "AI enhancement is limited to five uses per day per browser/device profile to control expensive client-side AI processing while keeping standard image tools unrestricted.",
      },
    ],

    technicalHighlights: [
      {
        title: "Client-Side Image Processing",
        description:
          "Used the Canvas API and browser image APIs to process, transform, preview, and export images without requiring a traditional image-processing backend.",
      },
      {
        title: "Real-ESRGAN Integration",
        description:
          "Integrated Real-ESRGAN through ONNX Runtime Web to perform AI-based image upscaling directly in the browser.",
      },
      {
        title: "WebGPU Acceleration",
        description:
          "Uses WebGPU when supported to accelerate AI inference, with a WASM/CPU fallback for environments where WebGPU is unavailable.",
      },
      {
        title: "Editable AI Results",
        description:
          "AI-upscaled images are converted into the current editable image state, allowing users to continue applying brightness, contrast, saturation, sharpness, and other adjustments after AI enhancement.",
      },
      {
        title: "Modular Tool Architecture",
        description:
          "Structured the image processing functionality into reusable components and utilities so enhancement, conversion, cropping, and resizing can evolve independently.",
      },
      {
        title: "Large Image Handling",
        description:
          "Implemented image-processing considerations for large resolutions, including resource cleanup and AI tiling strategies to reduce memory pressure during browser-based processing.",
      },
      {
        title: "Responsive Interface",
        description:
          "Built a responsive utility-focused interface that adapts the image workspace, controls, previews, and actions across desktop, tablet, and mobile devices.",
      },
    ],

    challenges: [
      {
        title: "Running AI in the Browser",
        description:
          "Running Real-ESRGAN locally requires significant CPU, GPU, memory, and browser resources. The implementation needed to balance image quality with performance across different devices.",
      },
      {
        title: "Memory Management",
        description:
          "Large images and AI upscaling can create multiple high-resolution image buffers. Careful handling of image data and cleanup was necessary to reduce unnecessary memory usage.",
      },
      {
        title: "AI and Standard Editing",
        description:
          "The AI-enhanced image needed to remain fully editable after upscaling, requiring the processing pipeline to treat the AI result as the new editable image source without rerunning the AI model for normal adjustments.",
      },
      {
        title: "Browser Compatibility",
        description:
          "WebGPU availability varies across browsers, operating systems, hardware, and drivers, so the AI processing architecture needed a reliable fallback path for unsupported environments.",
      },
      {
        title: "Maintaining Image Quality",
        description:
          "Different image formats and browser export methods can affect quality and file size, requiring careful handling of format conversion and output quality settings.",
      },
      {
        title: "Performance on Mobile Devices",
        description:
          "Image processing and AI inference can be significantly more demanding on smaller devices, requiring the interface and processing workflow to remain lightweight and responsive.",
      },
    ],
  },

  {
    title: "Gamevault",
    slug: "gamevault",

    description:
      "A game discovery platform for browsing and exploring video games through a clean and responsive interface.",

    year: 2024,
    category: "Web Application",

    live: "https://github.com/Sadab-Kibria/Gamevault",
    source: "https://sadab-kibria.github.io/Gamevault/",

    image: "/projects/gamevault/hero.avif",

    gallery: [
      "/projects/gamevault/features.avif",
      "/projects/gamevault/strategy.avif",
      "/projects/gamevault/pricing.avif",
      "/projects/gamevault/testimonials.avif",
      "/projects/gamevault/footer.avif",
    ],

    tech: [
      "React",
      "TypeScript",
      "Tailwind CSS",
    ],

    role: "Frontend Developer",
    status: "Completed",

    overview:
      "Gamevault is a game discovery application focused on presenting large amounts of game information through a simple and visually engaging interface.",

    features: [
      {
        title: "Game Discovery",
        description:
          "Users can browse a collection of games through a visually focused grid interface.",
      },
      {
        title: "Game Details",
        description:
          "Individual game pages provide additional information and visual content.",
      },
    ],

    technicalHighlights: [
      {
        title: "Reusable Components",
        description:
          "Built reusable components for game cards, navigation, and content sections.",
      },
      {
        title: "Responsive Interface",
        description:
          "Designed the application to adapt between desktop and mobile layouts.",
      },
    ],

    challenges: [
      {
        title: "Information Density",
        description:
          "The interface needed to display a large amount of game information without making the experience feel cluttered.",
      },
    ],
  },

  {
    title: "Weather App",
    slug: "weather-app",

    description:
      "A responsive weather application that allows users to search for locations and view current weather information.",

    year: 2026,
    category: "Web Application",

    live: "https://github.com/Sadab-Kibria/Weather-App",
    source: "https://sadab-kibria.github.io/Weather-App/",

    image: "/projects/weather/weather.avif",

    gallery: [
      "/projects/weather/weather1.avif",
      "/projects/weather/weather2.avif",
    ],

    tech: [
      "HTML5",
      "CSS",
      "Javascript",
      "Weather API",
    ],

    role: "Frontend Developer",
    status: "Completed",

    overview:
      "A simple weather application focused on presenting weather information clearly while maintaining a minimal and responsive interface.",

    features: [
      {
        title: "Location Search",
        description:
          "Users can search for a location and retrieve its current weather information.",
      },
      {
        title: "Weather Information",
        description:
          "Displays current temperature and other relevant weather information in a clear visual hierarchy.",
      },
    ],

    technicalHighlights: [
      {
        title: "API Integration",
        description:
          "Integrated an external weather API to retrieve real-time weather information.",
      },
      {
        title: "Responsive UI",
        description:
          "Designed the interface to work across desktop and mobile devices.",
      },
    ],

    challenges: [
      {
        title: "API Handling",
        description:
          "Handled loading, successful responses, and invalid location searches while keeping the interface simple.",
      },
    ],
  },
];