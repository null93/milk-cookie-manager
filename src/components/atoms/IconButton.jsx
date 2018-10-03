import React from "react"
import PropTypes from "prop-types"

class IconButton extends React.Component {

	render () {
		let className = `icon-button ${this.props.active && this.props.stateful ? "active": ""}`
		return <div className={ className } onClick={ this.props.onClick } >
			<i className="material-icons" >
				{ this.props.children }
			</i>
		</div>
	}

}

IconButton.propTypes = {
	active: PropTypes.bool,
	children: PropTypes.string.isRequired,
	onClick: PropTypes.func,
	stateful: PropTypes.bool.isRequired
}

IconButton.defaultProps = {
	active: false,
	onClick: null,
}

export default IconButton
