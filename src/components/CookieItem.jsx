import React from "react"
import PropTypes from "prop-types"
import Paper from "@material-ui/core/Paper"
import Divider from "@material-ui/core/Divider"
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
import { withStyles } from "@material-ui/core/styles"

const styles = theme => ({
	paper: {
		padding: theme.spacing ( 1, 2 ),
		width: "100%",
		display: "flex",
		userSelect: "none",
		borderBottom: `solid 1px ${theme.palette.divider}`,
		cursor: "pointer",
		borderRadius: 0,
		"&:hover": {
			backgroundColor: theme.palette.action.hover,
			transition: theme.transitions.create (
				[ "background-color" ],
				{ duration: theme.transitions.duration.complex }
			)
		},
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
	divider: {
		height: "calc( 100% - 8px )",
		margin: "4px 16px",
	},
	secondary: {
		color: theme.palette.text.secondary,
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

class CookieItem extends React.Component {

	render () {
		const { classes, cookie, style, hash, highlight, isProtected, onItemClick, onExpire, expirationFormat } = this.props
		const name = highlight ( cookie.name )
		const path = highlight ( cookie.domain + cookie.path )
		const value = highlight ( cookie.value )
		return <Paper
			key={hash}
			style={style}
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
				<div className={classes.cut + " " + classes.title} ><b>{cookie.name.length > 0 ? name : <b><em>{"Not Named"}</em></b>}</b></div>
				<div className={classes.cut + " " + classes.secondary} >{path}</div>
				<div className={classes.cut + " " + classes.secondary} >{cookie.value.length > 0 ? value : <b><em>{"EMPTY"}</em></b>}</div>
				<div className={classes.cut} >
				{
					cookie.expirationDate
					? <Expiration
						type={expirationFormat}
						timestamp={cookie.expirationDate}
						onExpire={onExpire}
					/>
					: <b><em>SESSION</em></b>
				}
				</div>
			</div>
			{isProtected && <ProtectOnIcon fontSize="small" className={classes.protectedIcon} />}
		</Paper>
	}

}

CookieItem.propTypes = {
	classes: PropTypes.object.isRequired,
	hash: PropTypes.string.isRequired,
	highlight: PropTypes.func.isRequired,
	cookie: PropTypes.object.isRequired,
	style: PropTypes.object.isRequired,
	isProtected: PropTypes.bool.isRequired,
	expirationFormat: PropTypes.string.isRequired,
	onExpire: PropTypes.func.isRequired,
	onItemClick: PropTypes.func.isRequired,
}

export default withStyles ( styles ) ( CookieItem )
