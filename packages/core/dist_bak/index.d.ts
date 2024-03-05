import * as react from 'react';
import { ReactElement, ReactNode, CSSProperties } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { DragStart, DragUpdate } from 'react-beautiful-dnd';

type Adaptor<AdaptorParams = {}> = {
    name: string;
    fetchList: (adaptorParams?: AdaptorParams) => Promise<Record<string, any>[] | null>;
};
type WithId<T> = T & {
    id: string;
};
type Field<Props extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> = {
    type: "text" | "textarea" | "number" | "select" | "array" | "external" | "radio" | "custom";
    label?: string;
    adaptor?: Adaptor;
    adaptorParams?: object;
    arrayFields?: {
        [SubPropName in keyof Props]: Field<Props[SubPropName][0]>;
    };
    getItemSummary?: (item: Props, index?: number) => string;
    defaultItemProps?: Props;
    render?: (props: {
        field: Field;
        name: string;
        value: any;
        onChange: (value: any) => void;
        readOnly?: boolean;
    }) => ReactElement;
    options?: {
        label: string;
        value: string | number | boolean;
    }[];
};
type DefaultRootProps = {
    children: ReactNode;
    title: string;
    editMode: boolean;
    [key: string]: any;
};
type DefaultComponentProps = {
    [key: string]: any;
    editMode?: boolean;
};
type Fields<ComponentProps extends DefaultComponentProps = DefaultComponentProps> = {
    [PropName in keyof Omit<Required<ComponentProps>, "children" | "editMode">]: Field<ComponentProps[PropName][0]>;
};
type Content<Props extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> = MappedItem<Props>[];
type ComponentConfig<ComponentProps extends DefaultComponentProps = DefaultComponentProps, DefaultProps = ComponentProps> = {
    render: (props: WithId<ComponentProps>) => ReactElement;
    defaultProps?: DefaultProps;
    fields?: Fields<ComponentProps>;
};
type Config<Props extends {
    [key: string]: any;
} = {
    [key: string]: any;
}, RootProps extends DefaultRootProps = DefaultRootProps> = {
    components: {
        [ComponentName in keyof Props]: ComponentConfig<Props[ComponentName], Props[ComponentName]>;
    };
    root?: ComponentConfig<RootProps & {
        children: ReactNode;
    }, Partial<RootProps & {
        children: ReactNode;
    }>>;
};
type MappedItem<Props extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> = {
    type: keyof Props;
    props: WithId<{
        [key: string]: any;
    }>;
};
type Data<Props extends {
    [key: string]: any;
} = {
    [key: string]: any;
}, RootProps extends {
    title: string;
    [key: string]: any;
} = {
    title: string;
    [key: string]: any;
}> = {
    root: RootProps;
    content: Content<Props>;
    zones?: Record<string, Content<Props>>;
};

declare const Button: ({ children, href, onClick, variant, type, disabled, tabIndex, newTab, fullWidth, icon, size, }: {
    children: ReactNode;
    href?: string | undefined;
    onClick?: ((e: any) => void | Promise<void>) | undefined;
    variant?: "primary" | "secondary" | undefined;
    type?: "button" | "submit" | "reset" | undefined;
    disabled?: boolean | undefined;
    tabIndex?: number | undefined;
    newTab?: boolean | undefined;
    fullWidth?: boolean | undefined;
    icon?: ReactNode;
    size?: "medium" | "large" | undefined;
}) => react_jsx_runtime.JSX.Element;

type ItemSelector = {
    index: number;
    zone?: string;
};

type InsertAction = {
    type: "insert";
    componentType: string;
    destinationIndex: number;
    destinationZone: string;
};
type DuplicateAction = {
    type: "duplicate";
    sourceIndex: number;
    sourceZone: string;
};
type ReplaceAction = {
    type: "replace";
    destinationIndex: number;
    destinationZone: string;
    data: any;
};
type ReorderAction = {
    type: "reorder";
    sourceIndex: number;
    destinationIndex: number;
    destinationZone: string;
};
type MoveAction = {
    type: "move";
    sourceIndex: number;
    sourceZone: string;
    destinationIndex: number;
    destinationZone: string;
};
type RemoveAction = {
    type: "remove";
    index: number;
    zone: string;
};
type SetDataAction = {
    type: "set";
    data: Partial<Data>;
};
type RegisterZoneAction = {
    type: "registerZone";
    zone: string;
};
type UnregisterZoneAction = {
    type: "unregisterZone";
    zone: string;
};
type PuckAction = ReorderAction | InsertAction | MoveAction | ReplaceAction | RemoveAction | DuplicateAction | SetDataAction | RegisterZoneAction | UnregisterZoneAction;

type PathData = Record<string, {
    selector: ItemSelector | null;
    label: string;
}[]>;
type DropZoneContext = {
    data: Data;
    config: Config;
    itemSelector?: ItemSelector | null;
    setItemSelector?: (newIndex: ItemSelector | null) => void;
    dispatch?: (action: PuckAction) => void;
    areaId?: string;
    draggedItem?: DragStart & Partial<DragUpdate>;
    placeholderStyle?: CSSProperties;
    hoveringArea?: string | null;
    setHoveringArea?: (area: string | null) => void;
    hoveringZone?: string | null;
    setHoveringZone?: (zone: string | null) => void;
    hoveringComponent?: string | null;
    setHoveringComponent?: (id: string | null) => void;
    registerZoneArea?: (areaId: string) => void;
    areasWithZones?: Record<string, boolean>;
    registerZone?: (zoneCompound: string) => void;
    unregisterZone?: (zoneCompound: string) => void;
    activeZones?: Record<string, boolean>;
    pathData?: PathData;
    registerPath?: (selector: ItemSelector) => void;
    mode?: "edit" | "render";
    zoomLevel?: number;
} | null;
declare const dropZoneContext: react.Context<DropZoneContext>;
declare const DropZoneProvider: ({ children, value, }: {
    children: ReactNode;
    value: DropZoneContext;
}) => react_jsx_runtime.JSX.Element;

type DropZoneProps = {
    zone: string;
    style?: CSSProperties;
};
declare function DropZone(props: DropZoneProps): react_jsx_runtime.JSX.Element;

declare const IconButton: ({ children, href, onClick, variant, type, disabled, tabIndex, newTab, fullWidth, title, }: {
    children: ReactNode;
    href?: string | undefined;
    onClick?: ((e: any) => void | Promise<void>) | undefined;
    variant?: "primary" | "secondary" | undefined;
    type?: "button" | "submit" | "reset" | undefined;
    disabled?: boolean | undefined;
    tabIndex?: number | undefined;
    newTab?: boolean | undefined;
    fullWidth?: boolean | undefined;
    title: string;
}) => react_jsx_runtime.JSX.Element;

type Plugin = {
    renderRootFields?: (props: {
        children: ReactNode;
        data: Data;
    }) => ReactElement<any>;
    renderRoot?: (props: {
        children: ReactNode;
        data: Data;
    }) => ReactElement<any>;
    renderFields?: (props: {
        children: ReactNode;
        data: Data;
    }) => ReactElement<any>;
};

declare function Puck({ config, data: initialData, onChange, onPublish, plugins, renderHeader, renderHeaderActions, headerTitle, headerPath, containerStyle, }: {
    config: Config;
    data: Data;
    onChange?: (data: Data) => void;
    onPublish: (data: Data) => void;
    plugins?: Plugin[];
    renderHeader?: (props: {
        children: ReactNode;
        data: Data;
        dispatch: (action: PuckAction) => void;
    }) => ReactElement;
    renderHeaderActions?: (props: {
        data: Data;
        dispatch: (action: PuckAction) => void;
    }) => ReactElement;
    headerTitle?: string;
    headerPath?: string;
    containerStyle?: React.CSSProperties;
}): react_jsx_runtime.JSX.Element;

declare function Render({ config, data }: {
    config: Config;
    data: Data;
}): react_jsx_runtime.JSX.Element;

declare const FieldLabel: ({ children, icon, label, }: {
    children?: ReactNode;
    icon?: ReactNode;
    label: string;
}) => react_jsx_runtime.JSX.Element;

export { Adaptor, Button, ComponentConfig, Config, Content, Data, DefaultComponentProps, DefaultRootProps, DropZone, DropZoneProvider, Field, FieldLabel, Fields, IconButton, Puck, Render, dropZoneContext };
