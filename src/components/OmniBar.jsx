import React from "react"
import PropTypes from "prop-types"
import Paper from "@material-ui/core/Paper"
import IconButton from "@material-ui/core/IconButton"
import InputBase from "@material-ui/core/InputBase"
import Divider from "@material-ui/core/Divider"
import Tooltip from "components/Tooltip"
import Fade from "@material-ui/core/Fade"
import Typography from "@material-ui/core/Typography"
import ClearIcon from "@material-ui/icons/Clear"
import FilterOnIcon from "@material-ui/icons/FilterAlt"
import FilterOffIcon from "@material-ui/icons/FilterAltOutlined"
import FilterGlobalIcon from "icons/FilterGlobal"
import WordSearchIcon from "@material-ui/icons/FormatQuote"
import RegExpIcon from "icons/RegExp"
import MainMenu from "components/MainMenu"
import CaseInsensitiveIcon from "@material-ui/icons/FormatStrikethrough"
import CaseSensitiveIcon from "@material-ui/icons/Title"
import Logo from "icons/Logo"
import { withStyles } from "@material-ui/core/styles"
import { withChrome } from "contexts/ChromeContext"
import compileRegExp from "utils/compileRegExp"

const styles = theme => ({
	root: {
		padding: theme.spacing ( 0.25, 0.5 ),
		display: "flex",
		alignItems: "center",
		position: "absolute",
		width: "100%",
		zIndex: 10,
		top: 0,
		left: 0,
		userSelect: "none",
		borderTop: `solid 1px transparent`,
		borderBottom: `solid 1px transparent`,
		transition: "all 200ms",
		borderRadius: 0,
	},
	unFocused: {
		borderBottom: `solid 1px ${theme.palette.divider}`,
	},
	input: {
		flex: 1,
		marginLeft: theme.spacing ( 0.5 ),
	},
	button: {
		padding: 6,
	},
	logo: {
		color: theme.palette.primary.main,
		fontSize: 34,
	},
	divider: {
		height: 28,
		margin: 4,
	},
	hits: {
		margin: theme.spacing ( 0, 1 ),
		whiteSpace: "pre",
		fontWeight: "bold",
	},
})

class OmniBar extends React.Component {

	constructor ( props ) {
		super ( props )
		this.state = {
			focused: true,
		}
	}

	render () {
		const { classes, data, theme } = this.props
		const { focused } = this.state
		const { activeUrl, search: { term }, options: { sensitive, filtered, regexp } } = data
		const hits = data.filtered.length
		return <Paper
			className={`${classes.root} ${!focused ? classes.unFocused : ""}`}
			elevation={focused ? 5 : 0}
			onFocus={() => this.setState ({ focused: true })}
			onBlur={() => this.setState ({ focused: false })} >
			<IconButton
				className={classes.button}
				disabled={true}
				size="small"
				color="primary" >
				<Logo viewBox="0 0 48 48" fontSize="inherit" className={classes.logo} />
			</IconButton>
			<InputBase
				autoFocus
				className={classes.input}
				placeholder={regexp ? "Search Cookies With RegExp" : "Search Cookies"}
				value={term}
				onChange={e => data.setTerm ( e.target.value )}
				inputProps={{ spellCheck: false }}
				style={
					regexp && term.length > 0 && !compileRegExp ( term )
					? { color: theme.palette.error.main }
					: {}
				}
			/>
			{
				term.length > 0 && <React.Fragment>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="bottom"
						title="Clear Search Term" >
						<IconButton
							size="small"
							color="primary"
							className={classes.button}
							onClick={() => data.setTerm ("")} >
							<ClearIcon/>
						</IconButton>
					</Tooltip>
					<Divider
						className={classes.divider}
						orientation="vertical"
					/>
				</React.Fragment>
			}
			<Typography
				variant="overline"
				className={classes.hits} >
				{`${hits.toString ().replace ( /\B(?=(\d{3})+(?!\d))/g, "," )} Cookie${hits > 1 || hits < 1 ? "s" : ""}`}
			</Typography>
			<Divider
				className={classes.divider}
				orientation="vertical"
			/>
			<Tooltip
				arrow
				TransitionComponent={Fade}
				placement="bottom"
				title={sensitive ? "Currently Case Sensitive" : "Currently Case Insensitive"} >
				<IconButton
					size="small"
					color="primary"
					className={classes.button}
					onClick={() => data.setSensitive ( !sensitive )} >
					{sensitive ? <CaseSensitiveIcon/> : <CaseInsensitiveIcon/>}
				</IconButton>
			</Tooltip>
			<Divider
				className={classes.divider}
				orientation="vertical"
			/>
			<Tooltip
				arrow
				TransitionComponent={Fade}
				placement="bottom"
				title={regexp ? "Searching With RegExp Pattern" : "Searching For Sub-Strings"} >
				<IconButton
					size="small"
					color="primary"
					className={classes.button}
					onClick={() => data.setRegExp ( !regexp )} >
					{regexp ? <RegExpIcon/> : <WordSearchIcon/>}
				</IconButton>
			</Tooltip>
			<Divider
				className={classes.divider}
				orientation="vertical"
			/>
			<Tooltip
				arrow
				TransitionComponent={Fade}
				placement="bottom"
				title={!activeUrl ? "Showing All Cookies, Focus Tab To Filter" : filtered ? "Filtering By Domain Of Last Focused Tab" : "Currently Showing All Cookies"} >
				<IconButton
					size="small"
					color="primary"
					className={classes.button}
					disabled={!activeUrl}
					onClick={() => data.setFiltered ( !filtered )} >
					{!activeUrl ? <FilterGlobalIcon/> : filtered ? <FilterOnIcon/> : <FilterOffIcon/>}
				</IconButton>
			</Tooltip>
			<Divider
				className={classes.divider}
				orientation="vertical"
			/>
			<MainMenu/>
		</Paper>
	}

}

OmniBar.propTypes = {
	classes: PropTypes.object.isRequired,
	data: PropTypes.object.isRequired,
}

export default withChrome ( withStyles ( styles, { withTheme: true } ) ( OmniBar ) )
