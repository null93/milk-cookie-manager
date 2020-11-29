import React from "react"
import PropTypes from "prop-types"
import MuiTooltip from "@material-ui/core/Tooltip"
import { withChrome } from "contexts/ChromeContext"

class Tooltip extends React.Component {

	render () {
		const { data } = this.props
		return data.options.tooltips
			? <MuiTooltip {...this.props} >
				<span>{this.props.children}</span>
			</MuiTooltip>
			: <React.Fragment>
				{this.props.children}
			</React.Fragment>
	}

}

Tooltip.propTypes = {
	data: PropTypes.object.isRequired,
}

export default withChrome ( Tooltip )
