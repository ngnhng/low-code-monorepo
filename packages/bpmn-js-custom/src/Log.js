import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";

export default function Log(eventBus, injector) {
    injector.invoke(CommandInterceptor, this);
}
