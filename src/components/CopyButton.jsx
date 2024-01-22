import browser from "webextension-polyfill"
import copy from "copy-to-clipboard"
import React from "react"
import PropTypes from "prop-types"
import Button from "@material-ui/core/Button"

class CopyButton extends React.Component { 

	constructor ( props ) {
		super ( props )
		this.state = {
			copied: false,
		}
	}

	handleClick () {
		const { data, duration } = this.props
		copy ( data )
		this.setState (
			{ copied: true },
			() => setTimeout (
				() => this.setState ({ copied: false }),
				duration
			)
		)
	}

	render () {
		const { data, duration, disabled, ...other } = this.props
		const { copied } = this.state
		return <Button
			{...other}
			disabled={disabled || copied}
			onClick={this.handleClick.bind ( this )} >
			{copied ? browser.i18n.getMessage ("copied") : browser.i18n.getMessage ("copy")}
		</Button>
	}

}

CopyButton.propTypes = {
	data: PropTypes.string.isRequired,
	duration: PropTypes.number,
}

CopyButton.defaultProps = {
	duration: 1000,
}

export default CopyButton
