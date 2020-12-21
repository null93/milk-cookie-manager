import React from "react"
import PropTypes from "prop-types"
import MuiTooltip from "@material-ui/core/Tooltip"
import { withStorage } from "contexts/StorageContext"

class Tooltip extends React.Component {

	render () {
		const { storage } = this.props
		return storage.data.tooltips
			? <MuiTooltip {...this.props} >
				<span>{this.props.children}</span>
			</MuiTooltip>
			: <React.Fragment>
				{this.props.children}
			</React.Fragment>
	}

}

Tooltip.propTypes = {
	storage: PropTypes.object.isRequired,
}

export default withStorage ( Tooltip )
