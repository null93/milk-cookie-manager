import _ from "lodash"
import React from "react"
import PropTypes from "prop-types"
import Paper from "@material-ui/core/Paper"
import Divider from "@material-ui/core/Divider"
import Fab from "@material-ui/core/Fab"
import AddIcon from "@material-ui/icons/Add"
import ProtectOnIcon from "@material-ui/icons/Security"
import SecureOnIcon from "@material-ui/icons/Lock"
import SecureOffIcon from "icons/SecureOff"
import HttpOnlyOnIcon from "@material-ui/icons/VisibilityOff"
import HttpOnlyOffIcon from "@material-ui/icons/Visibility"
import UnspecifiedIcon from "icons/Unspecified"
import NoRestrictionIcon from "@material-ui/icons/GpsOff"
import LaxIcon from "@material-ui/icons/GpsNotFixed"
import StrictIcon from "@material-ui/icons/GpsFixed"
import Expiration from "components/Expiration"
import { FixedSizeList } from "react-window"
import { withStyles } from "@material-ui/core/styles"
import { withChrome } from "contexts/ChromeContext"
import compileRegExp from "utils/compileRegExp"

const styles = theme => ({
	paper: {
		padding: theme.spacing ( 1, 2 ),
		width: "100%",
		display: "flex",
		userSelect: "none",
		borderBottom: `solid 1px ${theme.palette.divider}`,
		cursor: "pointer",
		borderRadius: 0,
		// "&:hover": {
		// 	backgroundColor: theme.palette.action.hover,
		// 	transition: theme.transitions.create (
		// 		[ "background-color" ],
		// 		{ duration: theme.transitions.duration.complex }
		// 	)
		// },
	},
	title: {
		fontSize: "1.05em",
	},
	cut: {
		whiteSpace: "nowrap",
		textOverflow: "ellipsis",
		display: "block",
		overflow: "hidden",
		width: "100%",
		padding: 0,
		margin: 0,
	},
	left: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		justifyContent: "space-between",
		padding: "0 2.5px",
	},
	right: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		position: "relative",
		width: "calc( 100% - 54px)",
		paddingRight: 30,
		marginLeft: 4,
	},
	none: {
		height: "calc( 100vh - 52px )",
		width: "100vw",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		fontSize: "4.5em",
		fontWeight: 900,
		textAlign: "center",
		textTransform: "uppercase",
		marginTop: 50,
	},
	divider: {
		height: "calc( 100% - 8px )",
		margin: "4px 16px",
	},
	secondary: {
		color: theme.palette.text.secondary,
	},
	fab: {
		position: "fixed",
		right: theme.spacing ( 1 ),
		bottom: theme.spacing ( 1 ),
	},
	protectedIcon: {
		position: "absolute",
		color: theme.palette.primary.main,
		height: 40,
		marginTop: -20,
		top: "50%",
		right: theme.spacing ( 1 ),
		fontSize: 23,
	},
})

function createCookieKey ( cookie ) {
	return `<${cookie.name}><${cookie.domain}><${cookie.path}>`
}

class Cookies extends React.Component {

	highlight ( target ) {
		const { data } = this.props
		var { search: { term }, options: { regexp, sensitive } } = data
		var re = compileRegExp ( term )
		var last = 0
		var result = []
		var match = null
		if ( regexp && term && re ) {
			while ( ( match = re.exec ( target ) ) != null ) {
				if ( !match || !match [ 0 ] || match [ 0 ].length < 1 ) break
				if ( match.index > last ) {
					result.push ( target.substring ( last, match.index ) )
				}
				result.push ( <mark key={match.index} >{match [ 0 ]}</mark> )
				last = match.index + match [ 0 ].length
			}
			if ( last < target.length ) {
				result.push ( target.substring ( last ) )
			}
			return result
		}
		else if ( regexp || term.length < 1 ) {
			return target
		}
		const targetForMatch = sensitive ? target : target.toLowerCase ()
		const searchTermForMatch = sensitive ? term : term.toLowerCase ()
		do {
			match = targetForMatch.indexOf ( searchTermForMatch, last )
			if ( match < 0 ) break
			if ( last !== match ) result.push ( target.substring ( last, match ) )
			result.push ( <mark key={match} >
				{target.substring ( match, match + term.length )}
			</mark> )
			last = match + term.length
		}
		while ( match > -1 )
		if ( last < target.length ) {
			result.push ( target.substring ( last ) )
		}
		return result
	}

	renderItem ( index, style, cookie ) {
		const { classes, data, term, onItemClick } = this.props
		const protectList = data.list.protect
		const key = createCookieKey ( cookie )
		const isProtected = key in protectList
		const name = this.highlight ( cookie.name )
		const path = this.highlight ( cookie.domain + cookie.path )
		const value = this.highlight ( cookie.value )
		return <Paper
			key={`${index}-${key}`}
			className={classes.paper}
			elevation={0}
			style={style}
			onMouseUp={() => onItemClick ( cookie )} >
			<div className={classes.left} >
				{cookie.secure ? <SecureOnIcon fontSize="small" /> : <SecureOffIcon fontSize="small" />}
				{cookie.httpOnly ? <HttpOnlyOnIcon fontSize="small" /> : <HttpOnlyOffIcon fontSize="small" />}
				{{
					unspecified: <UnspecifiedIcon fontSize="small" />,
					no_restriction: <NoRestrictionIcon fontSize="small" />,
					lax: <LaxIcon fontSize="small" />,
					strict: <StrictIcon fontSize="small" />,
				} [ cookie.sameSite ]}
			</div>
			<Divider
				className={classes.divider}
				orientation="vertical"
			/>
			<div className={classes.right} >
				<div className={classes.cut + " " + classes.title} ><b>{cookie.name.length > 0 ? name : <b><em>{"<EMPTY>"}</em></b>}</b></div>
				<div className={classes.cut + " " + classes.secondary} >{path}</div>
				<div className={classes.cut + " " + classes.secondary} >{cookie.value.length > 0 ? value : <b><em>{"<EMPTY>"}</em></b>}</div>
				<div className={classes.cut} >
				{
					cookie.expirationDate
					? <Expiration
						type={data.options.expirationFormat}
						timestamp={cookie.expirationDate}
						onExpire={() => data.loadCookies ()}
					/>
					: <b><em>{"<SESSION>"}</em></b>
				}
				</div>
			</div>
			{isProtected && <ProtectOnIcon fontSize="small" className={classes.protectedIcon} />}
		</Paper>
	}

	render () {
		const { classes, data, onCreate } = this.props
		var items = _.sortBy ( data.filtered, o => data.options.sortType === "expirationDate"
			? o [ data.options.sortType ]
			: o [ data.options.sortType ]
				.replace (/^[^0-9a-z]*/i, "")
				.toLowerCase ()
		)
		if ( data.options.sortDirection === "descending" ) {
			_.reverse ( items )
		}
		return <React.Fragment>
			{
				items.length <= 0 && <div className={classes.none} >
					No Cookies<br/>Found
				</div>
			}
			{
				items.length > 0 && <FixedSizeList
					style={{ marginTop: 52 }}
					height={window.innerHeight - 52}
					width="100%"
					itemSize={85}
					itemCount={items.length} >
					{
						({ index, style }) => {
							const cookie = items [ index ]
							return this.renderItem ( index, style, cookie )
						}
					}
				</FixedSizeList>
			}
			<Fab
				color="primary"
				size="medium"
				className={classes.fab}
				onClick={onCreate} >
				<AddIcon/>
			</Fab>
		</React.Fragment>
	}

}

Cookies.propTypes = {
	classes: PropTypes.object.isRequired,
	data: PropTypes.object.isRequired,
	onItemClick: PropTypes.func.isRequired,
	onCreate: PropTypes.func.isRequired,
}

export default withChrome ( withStyles ( styles ) ( Cookies ) )
