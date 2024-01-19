const Drawer = ({ anchor, children, dispatch, onClose }) => {
	return (
		<div
			className="drawer"
			style={{
				alignItems: "center",
				display: "flex",
				height: "100%",
				width: "100%",
			}}
		>
			<div
				className="drawer__first"
				style={{
					display: "flex",
					flexDirection: "column",
					background: "#fff",
					width: "50%",
					height: "100%",
					flexShrink: 0,
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{children}
			</div>
			<div
				className="drawer__second"
				style={{
					background: "transparent",
					flex: 1,
					height: "100%",
				}}
				onClick={onClose}
			/>
		</div>
	);
};

export default Drawer;
