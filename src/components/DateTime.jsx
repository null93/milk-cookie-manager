import moment from "moment"
import React from "react"
import PropTypes from "prop-types"
import InputBase from "@material-ui/core/InputBase"
import FormControl from "@material-ui/core/FormControl"
import InputLabel from "@material-ui/core/InputLabel"
import Typography from "@material-ui/core/Typography"
import Tooltip from "@material-ui/core/Tooltip"
import Fade from "@material-ui/core/Fade"
import InputAdornment from "@material-ui/core/InputAdornment"
import IconButton from "@material-ui/core/IconButton"
import TodayIcon from "@material-ui/icons/today"
import { withStyles } from "@material-ui/core/styles"

const styles = theme => ({
	root: {
		display: "flex",
		flexWrap: "nowrap",
		width: "100%",
		position: "relative",
		transition: "all 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
		backgroundColor: "rgba(0, 0, 0, 0.25)",
		alignItems: "center",
		borderBottom: `solid 1px ${theme.palette.background.paper}`,
		"&:after": {
			left: 0,
			right: 0,
			bottom: -1,
			content: "''",
			position: "absolute",
			transform: "scaleX(0)",
			transition: "transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
			borderBottom: `2px solid ${theme.palette.primary.main}`,
			pointerEvents: "none",
		},
		"&:hover": {
			borderBottom: `solid 1px ${theme.palette.common.white}`,
		},
	},
	disabled: {
		"&:hover": {
			borderBottom: `solid 1px ${theme.palette.background.paper}`,
		},
	},
	focused: {
		"&:after": {
			transform: "scaleX(1)",
			borderBottomColor: theme.palette.primary.main,
		},
		"&:hover": {
			borderBottom: `solid 1px ${theme.palette.primary.main}`,
		},
	},
	error: {
		"&:after": {
			transform: "scaleX(1)",
			borderBottomColor: theme.palette.error.main,
		},
		"&:hover": {
			borderBottom: `solid 1px ${theme.palette.error.main}`,
		},
	},
	input: {
		padding: 0,
	},
	date: {
		padding: "25px 0px 8px 12px",
	},
	time: {
		flex: 1,
		width: "100%",
		padding: "25px 12px 8px 0px",
	},
	label: {
		position: "absolute",
		left: 12,
		top: 8,
	},
	today: {
		marginRight: 12,
	},
	disabledComma: {
		opacity: theme.palette.action.disabledOpacity,
	}
})

class DateTime extends React.Component {

	constructor ( props ) {
		super ( props )
		this.state = {
			focused: false,
		}
	}

	handleChange ( date, time ) {
		const { onChange } = this.props
		onChange ( `${date}T${time}` )
	}

	handleToday () {
		const { onChange } = this.props
		const now = moment ().format ("YYYY-MM-DDTHH:mm:ss")
		onChange ( now )
	}

	render () {
		const { classes, value, onChange, disabled, error, disabledMessage } = this.props
		const { focused } = this.state
		const current = moment ( value, "YYYY-MM-DDTHH:mm:ss" )
		const date = current.format ("YYYY-MM-DD")
		const time = current.format ("HH:mm:ss")
		return <div className={[
				classes.root,
				focused && !disabled && classes.focused,
				disabled && classes.disabled,
				error && classes.error,
			].filter ( e => typeof e === "string" ).join (" ")}
			onClick={() => this.setState ({ focused: !disabled })} >
			<InputLabel shrink className={classes.label} focused={focused} disabled={disabled} error={error} >
				{`Expires (${disabled ? disabledMessage : moment.duration ( current - moment () ).humanize ()})`}
			</InputLabel>
			<InputBase
				className={classes.date}
				id="date"
				type="date"
				value={date}
				disabled={disabled}
				onFocus={() => this.setState ({ focused: true })}
				onBlur={() => this.setState ({ focused: false })}
				onChange={event => this.handleChange ( event.target.value, time )}
				inputProps={{
					className: classes.input,
					required: "required",
				}}
			/>
			<InputBase
				className={classes.time}
				id="time"
				type="time"
				value={time}
				disabled={disabled}
				onFocus={() => this.setState ({ focused: true })}
				onBlur={() => this.setState ({ focused: false })}
				onChange={event => this.handleChange ( date, event.target.value )}
				inputProps={{
					step: "1",
					className: classes.input,
					required: "required",
				}}
			/>
			<Tooltip
				arrow
				TransitionComponent={Fade}
				placement="left"
				title="Today" >
				<div>
					<IconButton
						disabled={false}
						tabIndex={-1}
						className={classes.today}
						disabled={disabled}
						onClick={() => this.handleToday ()} >
						<TodayIcon
							fontSize="small"
							color={disabled ? "disabled" : "primary"}
						/>
					</IconButton>
				</div>
			</Tooltip>
		</div>
	}

}

DateTime.propTypes = {
	classes: PropTypes.object.isRequired,
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	error: PropTypes.bool,
	disabled: PropTypes.bool,
	disabledMessage: PropTypes.string,
}

DateTime.defaultProps = {
	disabled: false,
	disabledMessage: "when browser is closed",
}

export default withStyles ( styles ) ( DateTime )
