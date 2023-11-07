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
			<div className="drawer__first">{children}</div>
			<div className="drawer__second" onClick={onClose} />
			<style jsx>{`
				.drawer__first {
					background: #fff;
					width: 50%;
					height: 100%;
					flex-shrink: 0;

					align-items: center;
					display: flex;
					justify-content: center;
				}
				.drawer__second {
					background: transparent;
					flex: 1;
					height: 100%;
				}

				.drawer__first > * {
					width: 100%;
					height: 100%;
				}
			`}</style>
		</div>
	);
};

export default Drawer;
