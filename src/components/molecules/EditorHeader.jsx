import React from "react"
import PropTypes from "prop-types"

import IconButton from "atom/IconButton"
import Menu from "molecule/Menu"
import MenuItem from "atom/MenuItem"

class EditorHeader extends React.Component {

	constructor ( props ) {
		super ( props )
		this.state = {
			menu: false,
			menuIcon: false
		}
	}

	setMenu ( value, callback ) {
		this.setState ({
			menu: value,
			menuIcon: value
		})
		if ( callback && typeof callback === "function" ) {
			callback ()
		}
	}

	render () {
		return <div className="editor-header" >
			<IconButton
				stateful={false}
				onClick={this.props.onClose} >
				close
			</IconButton>
			<h1>{this.props.title}</h1>
			<IconButton
				stateful={false}
				active={this.state.menuIcon}
				onClick={this.setMenu.bind ( this, true )} >
				more_vert
			</IconButton>
			<Menu
				active={this.state.menu}
				onBackgroundClick={this.setMenu.bind ( this, false )}
				top={50}
				left={325} >
				<MenuItem
					onClick={this.props.onDelete} >
					Delete
				</MenuItem>
				<MenuItem
					onClick={this.props.onDuplicate} >
					Duplicate
				</MenuItem>
				<MenuItem
					onClick={this.props.onExport} >
					Export
				</MenuItem>
			</Menu>
		</div>
	}

}

EditorHeader.propTypes = {
	title: PropTypes.string,
	onClose: PropTypes.func
}

EditorHeader.defaultProps = {
	title: "",
	onClose: null
}

export default EditorHeader
