export default function Title({
    name,
    description
} : {
    name: string,
    description: string
}): JSX.Element {
    return <div className="w-full flex flex-col gap-2.5">
        <div className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">{name}</div>
        <div className="text-sm font-medium leading-none">{description}</div>
    </div>
}