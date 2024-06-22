import copy from "copy-to-clipboard"
import React from "react"
import TextField from "@material-ui/core/TextField"
import Tooltip from "components/Tooltip"
import Fade from "@material-ui/core/Fade"
import InputAdornment from "@material-ui/core/InputAdornment"
import IconButton from "@material-ui/core/IconButton"
import CopyIcon from "@material-ui/icons/FlipToFront"
import DoneIcon from "@material-ui/icons/Done"
import { withI18n } from "contexts/I18nContext"

class StyledTextField extends React.Component {

	constructor ( props ) {
		super ( props )
		this.timeout = null
		this.state = {
			done: false,
		}
	}

	componentWillUnmount () {
		if ( this.timeout ) {
			clearTimeout ( this.timeout )
		}
	}

	render () {
		const { closeSnackbar, i18n, ...props } = this.props
		const { done } = this.state
		return <TextField
			fullWidth
			InputProps={{
				inputProps: {
					spellCheck: "false",
				},
				endAdornment: <Tooltip
					arrow
					TransitionComponent={Fade}
					placement="left"
					title={done ? i18n.translate ("copied") : i18n.translate ("copyToClipboard")} >
					<InputAdornment position="end" >
						<IconButton
							tabIndex={-1}
							disabled={props.disabled || done}
							onClick={() => {
								copy ( props.value )
								this.setState ({ done: true }, () => {
									this.timeout = setTimeout ( () => {
										this.setState ({ done: false })
									}, 2000 )
								})
							}} >
							{
								done
								? <DoneIcon
									fontSize="small"
									color={props.disabled || done ? "disabled" : "primary"}
								/>
								: <CopyIcon
									fontSize="small"
									color={props.disabled || done ? "disabled" : "primary"}
								/>
							}
						</IconButton>
					</InputAdornment>
				</Tooltip>,
			}}
			{...props}
		/>
	}

}

export default withI18n ( StyledTextField )
