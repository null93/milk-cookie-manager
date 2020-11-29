import React from "react"
import SvgIcon from "@material-ui/core/SvgIcon"

class HostOnlyOn extends React.Component {

	render () {
		return <SvgIcon {...this.props} >
			<path d="M19,10H5V8H19V10M19,16H5V14H19V16Z" />
		</SvgIcon>
	}

}

export default HostOnlyOn
