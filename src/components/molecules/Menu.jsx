import React from "react"
import PropTypes from "prop-types"
import MenuItem from "atom/MenuItem"

class Menu extends React.Component {

	render () {
		let stopProp = ( e ) => e.stopPropagation ()
		return <div
			className={`menu ${this.props.active ? "active" : ""}`}
			onClick={this.props.onBackgroundClick} >
			<div
				className="menu-wrapper"
				style={{ top: `${this.props.top}px`, left: `${this.props.left}px` }}
				onClick={stopProp} >
				{this.props.children}
			</div>
		</div>
	}

}

Menu.propTypes = {
	// children: PropTypes.arrayOf ( PropTypes.oneOfType ([ MenuItem ]) ),
	active: PropTypes.bool,
	onBackgroundClick: PropTypes.func,
	top: PropTypes.number,
	left: PropTypes.number
}

Menu.defaultProps = {
	active: true,
	children: [],
	onBackgroundClick: null,
	top: 0,
	left: 0
}

export default Menu
