import React from "react"
import PropTypes from "prop-types"

class MenuItem extends React.Component {

	render () {
		return <div
			className={`menu-item ${this.props.disabled ? "" : "active"}`}
			onClick={this.props.disabled ? null : this.props.onClick} >
			{this.props.children}
		</div>
	}

}

MenuItem.propTypes = {
	children: PropTypes.string,
	disabled: PropTypes.bool,
	onClick: PropTypes.func
}

MenuItem.defaultProps = {
	children: "",
	disabled: false,
	onClick: null
}

export default MenuItem
