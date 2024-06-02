/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChangeEvent, FC, useState } from "react";

export interface Tag {
    id: string;
    text: string;
}

export interface Suggestion {
    id: string;
    text: string;
}

interface InputWithTagsProps {
    tags: Tag[];
    suggestions: Suggestion[];
    separators: number[];
    handleDelete: (index: number) => void;
    handleAddition: (tag: Tag) => void;
    handleDrag?: (tag: Tag, currPos: number, newPos: number) => void;
    handleTagClick?: (index: number) => void;
    inputFieldPosition?: "inline" | "top" | "bottom";
    editable?: boolean;
    clearAll?: boolean;
    onClearAll?: () => void;
    maxTags?: number;
    allowAdditionFromPaste?: boolean;
}

export const InputWithTags: FC<InputWithTagsProps> = ({
    tags,
    suggestions,
    separators,
    handleDelete,
    handleAddition,
    handleDrag,
    handleTagClick,
    inputFieldPosition = "inline",
    editable,
    clearAll,
    onClearAll,
    maxTags,
    allowAdditionFromPaste,
}) => {
    console.log("render input with tags", tags, suggestions);
    const [inputValue, setInputValue] = useState("");
    const [isInputFocused, setInputFocused] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] =
        useState<Suggestion[]>(suggestions);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setFilteredSuggestions(
            suggestions.filter((suggestion) =>
                suggestion.text.toLowerCase().includes(value.toLowerCase())
            )
        );
    };

    const handleInputKeyDown = (e: any) => {
        if (separators.includes(e.keyCode) && inputValue) {
            handleAddition({ id: `${Date.now()}`, text: inputValue });
            setInputValue("");
        }
    };

    const handleInputFocus = () => {
        setInputFocused(true);
    };

    const handleInputBlur = () => {
        setInputFocused(false);
    };

    return (
        <div className="flex flex-wrap border border-gray-300 p-2 rounded-md">
            <div className="flex flex-wrap">
                {tags.map((tag, index) => (
                    <span
                        key={tag.id}
                        className="bg-gray-200 rounded-md p-1 m-1 flex items-center cursor-pointer"
                        onClick={() => handleTagClick && handleTagClick(index)}
                    >
                        {tag.text}
                        <button
                            className="ml-2 bg-transparent border-none cursor-pointer"
                            onClick={() => handleDelete(index)}
                        >
                            x
                        </button>
                    </span>
                ))}
            </div>
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="flex-1 border-none outline-none p-1"
                disabled={maxTags ? tags.length >= maxTags : false}
            />
            {isInputFocused && filteredSuggestions.length > 0 && (
                <ul className="list-none p-0 m-1 border border-gray-300 rounded-md max-h-40 overflow-y-auto">
                    {filteredSuggestions.map((suggestion) => (
                        <li
                            key={suggestion.id}
                            className="p-1 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                                handleAddition(suggestion);
                                setInputValue(suggestion.text);
                            }}
                        >
                            {suggestion.text}
                        </li>
                    ))}
                </ul>
            )}
            {clearAll && (
                <button className="mt-2" onClick={onClearAll}>
                    Clear All
                </button>
            )}
        </div>
    );
};
