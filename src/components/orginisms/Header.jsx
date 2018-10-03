import React from "react"
import PropTypes from "prop-types"

import IconButton from "atom/IconButton"
import SearchField from "atom/SearchField"
import MenuItem from "atom/MenuItem"
import Menu from "molecule/Menu"

class Header extends React.Component {

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
		return <div className="header" >
			<img src={this.props.logo} />
			<div className="center" >
				<SearchField onKeyUp={this.props.onSearch} />
			</div>
			<div className="menu-icon" >
				<IconButton
					stateful={true}
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
						onClick={this.setMenu.bind ( this, false, this.props.onCreateNew )} >
						Create New
					</MenuItem>
					<MenuItem
						onClick={this.setMenu.bind ( this, false, this.props.onDeleteAll )}
						disabled={this.props.disableDeleteAll} >
						{this.props.deleteMenuItemName}
					</MenuItem>
					<MenuItem
						onClick={this.setMenu.bind ( this, false, this.props.onCurl )} >
						Copy as cURL
					</MenuItem>
					<MenuItem
						onClick={this.setMenu.bind ( this, false, this.props.onImport )} >
						Import
					</MenuItem>
					<MenuItem
						onClick={this.setMenu.bind ( this, false, this.props.onExport )}
						disabled={this.props.disableExport} >
						Export
					</MenuItem>
					<MenuItem
						onClick={this.setMenu.bind ( this, false, this.props.onHelp )} >
						Help
					</MenuItem>
				</Menu>
			</div>
		</div>
	}

}

Header.propTypes = {
	disableDeleteAll: PropTypes.bool,
	disableExport: PropTypes.bool,
	onCreateNew: PropTypes.func,
	onDeleteAll: PropTypes.func,
	onImport: PropTypes.func,
	onExport: PropTypes.func,
	onHelp: PropTypes.func,
	onSearch: PropTypes.func,
	deleteMenuItemName: PropTypes.string,
	logo: PropTypes.string.isRequired
}

Header.defaultProps = {
	disableDeleteAll: false,
	disableExport: false,
	onCreateNew: null,
	onDeleteAll: null,
	onImport: null,
	onExport: null,
	onHelp: null,
	onSearch: null,
	deleteMenuItemName: "Delete All"
}

export default Header
