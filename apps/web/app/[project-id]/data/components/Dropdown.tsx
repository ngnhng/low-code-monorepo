import { useState, useRef, useEffect } from "react";

export const Dropdown = ({ title, dispatch, options, onSelect }) => {
	const [isOpen, setIsOpen] = useState(false);

	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div ref={dropdownRef} className={`dropdown ${isOpen ? "show" : ""}`}>
			<style jsx>{`
				.dropdown {
					position: relative;
					display: inline-block;
				}

				.dropdown-header {
					padding: 10px;
					font-size: 16px;
					cursor: pointer;
				}

				.dropdown-header:hover,
				.dropdown-header:focus {
					background-color: var(--puck-color-rose-8);
					border-radius: 20px;
				}

				.dropdown-list {
					display: none;
					position: absolute;
					background-color: #f9f9f9;
					padding: 10px;
					min-width: 160px;
					box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
					z-index: 3;
				}

				.dropdown-list div {
					color: black;
					padding: 20px 16px;
					text-decoration: none;
					display: block;
					font-size: 14px;
					border-bottom: 1px solid #ccc;
				}

				.dropdown-list div:hover {
					background-color: #f1f1f1;
				}

				.dropdown.show .dropdown-list {
					display: block;
				}
			`}</style>
			<div
				className="dropdown-header"
				tabIndex={0}
				onClick={() => setIsOpen((prev) => !prev)}
				onKeyDown={(event) => {
					if (event.key === "Enter" || event.key === " ") {
						setIsOpen((prev) => !prev);
					}
				}}
			>
				{title}
			</div>
			{isOpen && (
				<div className="dropdown-list">
					{options.map((option) => (
						<DropdownOption
							key={option.value}
							value={option.value}
							onSelect={(value) => {
								onSelect();
								dispatch({
									type: option.dispatcher,
								});
								setIsOpen(false);
							}}
						>
							{option.label}
							<div style={{ fontSize: "12px" }}>
								{option.description}
							</div>
						</DropdownOption>
					))}
				</div>
			)}
		</div>
	);
};

const DropdownOption = ({ value, children, onSelect }) => (
	<div
		className="dropdown-option"
		onClick={() => onSelect(value)}
		onKeyDown={(e) => {
			if (e.key === "Enter") {
				onSelect(value);
			}
		}}
	>
		{children}
	</div>
);
