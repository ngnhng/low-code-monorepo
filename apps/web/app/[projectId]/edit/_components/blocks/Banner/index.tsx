/* eslint-disable @next/next/no-img-element */
import { ComponentConfig } from "@measured/puck";

enum BannerStyle {
    SEPARATE = "separate",
    OVERLAY = "overlay",
    GRADIENT = "gradient",
}

export type BannerProps = {
    bannerUrl: string;
    text: string;
    secondaryText: string;
    style: BannerStyle;
};

export const Banner: ComponentConfig<BannerProps> = {
    fields: {
        bannerUrl: {
            type: "text",
            label: "Banner Image URL",
        },
        text: {
            type: "text",
            label: "Primary Text",
        },
        secondaryText: {
            type: "text",
            label: "Secondary Text",
        },
        style: {
            type: "select",
            options: [
                { label: "Separate", value: BannerStyle.SEPARATE },
                { label: "Overlay", value: BannerStyle.OVERLAY },
                { label: "Gradient", value: BannerStyle.GRADIENT },
            ],
        },
    },
    defaultProps: {
        bannerUrl: "",
        text: "",
        secondaryText: "",
        style: BannerStyle.GRADIENT,
    },
    render: ({ bannerUrl, text, secondaryText, style }) => {
         const getStyle = (style: BannerStyle) => {
            if (style === BannerStyle.GRADIENT) {
                return (
                    <div className="relative p-5 flex flex-col items-center justify-center w-full h-[200px]" key={style}>
                        <div className="w-full rounded-md overflow-hidden h-full absolute inset-0 m-auto p-5">
                            <div
                                style={{
                                    backgroundImage:
                                        bannerUrl === ""
                                            ? `linear-gradient(to bottom, rgba(0 0 0 /.3), rgba(0 0 0 /.7)), url(https://fukutotojido.s-ul.eu/nhOBOE6n)`
                                            : `linear-gradient(to bottom, rgba(0 0 0 /.3), rgba(0 0 0 /.7)), url(${bannerUrl})`,
                                }}
                                className="w-full h-full bg-cover bg-center rounded-md"
                            ></div>
                        </div>
                        <div className="relative text-xl font-bold text-white">{text}</div>
                        <div className="relative text-sm text-white">{secondaryText}</div>
                    </div>
                );
            }

            if (style === BannerStyle.OVERLAY) {
                return (
                    <div className="relative p-5 flex flex-col items-center justify-center w-full h-[200px]" key={style}>
                        <div className="w-full rounded-md overflow-hidden h-full absolute inset-0 m-auto p-5">
                            <div
                                style={{
                                    backgroundImage:
                                        bannerUrl === ""
                                            ? `linear-gradient(to bottom, rgba(0 0 0 /.7), rgba(0 0 0 /.7)), url(https://fukutotojido.s-ul.eu/nhOBOE6n)`
                                            : `linear-gradient(to bottom, rgba(0 0 0 /.7), rgba(0 0 0 /.7)), url(${bannerUrl})`,
                                }}
                                className="w-full h-full bg-cover bg-center rounded-md"
                            ></div>
                        </div>
                        <div className="relative text-xl font-bold text-white">{text}</div>
                        <div className="relative text-sm text-white">{secondaryText}</div>
                    </div>
                );
            }

            if (style === BannerStyle.SEPARATE)
                return (
                    <div className="p-5 flex flex-col w-full gap-5" key={style}>
                        <div className="flex flex-col w-full items-center">
                            <div className="text-xl font-bold">{text}</div>
                            <div className="text-sm">{secondaryText}</div>
                        </div>
                        <div className="w-full rounded-md overflow-hidden h-[200px] relative">
                            <div className="w-full h-full bg-black/40 absolute inset-0"></div>
                            <img
                                src={bannerUrl === "" ? "https://fukutotojido.s-ul.eu/nhOBOE6n" : bannerUrl}
                                alt=""
                                className="absolute w-full h-full object-cover object-center"
                            />
                        </div>
                    </div>
                );

            return "";
        };

        return <div key={style}>{getStyle(style)}</div>;
    },
};
