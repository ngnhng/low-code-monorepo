/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                muted: "rgb(245, 235, 243)",
                primary: "rgb(117,82,111)",
                background: "rgb(117,82,111)",
                card: "rgb(141,98,111)",
				popover: "rgb(141,98,111)",
            },
            borderRadius: {
                custom: "20px",
            },
        },
    },
    plugins: [],
};
