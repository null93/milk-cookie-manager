import moment from "moment"
import React from "react"
import PropTypes from "prop-types"
import Paper from "@material-ui/core/Paper"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import FormControl from "@material-ui/core/FormControl"
import InputLabel from "@material-ui/core/InputLabel"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import IconButton from "@material-ui/core/IconButton"
import Backdrop from "@material-ui/core/Backdrop"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import ToggleButtonGroup from "@material-ui/core/ToggleButtonGroup"
import ToggleButton from "@material-ui/core/ToggleButton"
import Grid from "@material-ui/core/Grid"
import StyledTextField from "components/StyledTextField"
import CloseIcon from "@material-ui/icons/Close"
import SecureOnIcon from "@material-ui/icons/Lock"
import SecureOffIcon from "icons/SecureOff"
import HostOnlyOnIcon from "icons/HostOnlyOn"
import HostOnlyOffIcon from "icons/HostOnlyOff"
import HttpOnlyOnIcon from "@material-ui/icons/VisibilityOff"
import HttpOnlyOffIcon from "@material-ui/icons/Visibility"
import SessionOnIcon from "@material-ui/icons/HistoryToggleOff"
import SessionOffIcon from "@material-ui/icons/Schedule"
import ProtectOnIcon from "@material-ui/icons/Security"
import ProtectOffIcon from "icons/ProtectOff"
import UnspecifiedIcon from "icons/Unspecified"
import NoRestrictionIcon from "@material-ui/icons/GpsOff"
import LaxIcon from "@material-ui/icons/GpsNotFixed"
import StrictIcon from "@material-ui/icons/GpsFixed"
import CookieMenu from "components/CookieMenu"
import DateTime from "components/DateTime"
import { withStyles } from "@material-ui/core/styles"
import { withStorage } from "contexts/StorageContext"
import { withCookies } from "contexts/CookiesContext"
import { withI18n } from "contexts/I18nContext"

const styles = theme => ({
	backdrop: {
		zIndex: 1000,
	},
	root: {
		width: "100%",
		height: "100%",
		zIndex: 100,
		maxWidth: 850,
		maxHeight: 530,
		userSelect: "none",
		borderRadius: 0,
	},
	header: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing ( 0.5, 0.5 ),
	},
	title: {
		flex: 1,
		padding: theme.spacing ( 0, 1 ),
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		textAlign: "center",
	},
	body: {
		padding: theme.spacing ( 0, 2 ),
	},
	toggleLabel: {
		marginLeft: theme.spacing ( 1 ),
	},
	primary: {
		display: "inline",
	},
	secondary: {
		display: "inline",
		paddingLeft: 5,
	},
	listItemText: {
		marginTop: 2,
		marginBottom: 2,
	},
})

class CookieViewer extends React.Component {

	constructor ( props ) {
		super ( props )
		const { cookies } = this.props
		this.state = {
			cookie: {
				...props.cookie,
			},
			error: false,
			key: cookies.hash ( props.cookie ),
			isProtected: this.isProtected (),
		}
	}

	isProtected () {
		const { storage, cookies, cookie } = this.props
		const key = cookies.hash ( cookie )
		return key in ( storage.data.protect || {} )
	}

	setCookie ( data, additional = {}, callback = () => {} ) {
		this.setState ( state => ({
			error: false,
			cookie: { ...state.cookie, ...data },
			...additional,
		}), callback )
	}

	handleSave ( duplicate = false ) {
		const { cookies } = this.props
		const isNewCookie = this.props.isNew
		const onClose = this.props.onClose
		const oldCookie = this.props.cookie
		const newCookie = {
			...(duplicate ? this.props : this.state).cookie,
			name: duplicate ? `${(duplicate ? this.props : this.state).cookie.name}_duplicate` : (duplicate ? this.props : this.state).cookie.name
		}
		return Promise.resolve ()
			.then ( () => isNewCookie || duplicate ? Promise.resolve () : cookies.delete ( oldCookie ) )
			.then ( () => cookies.set ( newCookie ) )
			.then ( () => onClose () )
			.catch ( error => {
				console.log ( error )
				return this.setState (
					{ error: error.message },
					() => isNewCookie || duplicate ? Promise.resolve () : cookies.set ( oldCookie )
				)
			})
	}

	getErrorMessage () {
		const { i18n } = this.props
		const { error, cookie } = this.state
		if ( cookie.name.length < 1 && cookie.value.length < 1 ) {
			return i18n.translate ("errorCookieNameValueEmpty")
		}
		return `${i18n.translate ("error")}: ${error}`
	}

	render () {
		const {
			classes,
			isNew,
			onClose,
			exportJson,
			onDownloadJson,
			exportNetscape,
			onDownloadNetscape,
			onDelete,
			onBlock,
			onProtect,
			onRemoveProtect,
			i18n,
		} = this.props
		const { isProtected, error } = this.state
		const { name, domain, path, expirationDate, sameSite, value, hostOnly, httpOnly, secure, session } = this.state.cookie
		return <Backdrop
			open={true}
			onClose={() => onClose ()}
			className={classes.backdrop} >
			<Paper className={classes.root} elevation={5} >
				<div className={classes.header} >
					<IconButton
						className={classes.button}
						size="medium"
						color="primary"
						onClick={() => onClose ()} >
						<CloseIcon/>
					</IconButton>
					<Typography className={classes.title} >
						<b>{name || <i>{i18n.translate ("notNamed")}</i>}</b>
					</Typography>
					<CookieMenu
						disabled={isNew}
						isProtected={isProtected}
						onDelete={onDelete}
						onBlock={onBlock}
						onClose={onClose}
						exportJson={exportJson}
						onDownloadJson={onDownloadJson}
						exportNetscape={exportNetscape}
						onDownloadNetscape={onDownloadNetscape}
						onDuplicate={() => {
							this.handleSave ( true )
							onClose ()
						}}
					/>
				</div>
				<Grid container spacing={1} className={classes.body} >
					<Grid item xs={12} md={12} >
						<StyledTextField
							error={Boolean ( error )}
							disabled={isProtected}
							autoFocus={true}
							value={name}
							label={i18n.translate ("name")}
							variant="filled"
							onChange={e => this.setCookie ({ name: e.target.value })}
							inputProps={{ name: "name" }}
						/>
					</Grid>
					<Grid item xs={12} md={12} >
						<StyledTextField
							error={Boolean ( error )}
							disabled={isProtected}
							value={`${hostOnly ? "" : "."}${domain.replace (/^\./, "")}`}
							label={i18n.translate ("domain")}
							variant="filled"
							onChange={e => this.setCookie ({ domain: `${hostOnly ? "" : "."}${e.target.value.replace (/^\./, "")}` })}
							inputProps={{ name: "domain" }}
						/>
					</Grid>
					<Grid item xs={12} md={12} >
						<StyledTextField
							error={Boolean ( error )}
							disabled={isProtected || name.startsWith("__Host")}
							value={name.startsWith("__Host") ? "/" : `/${path.replace (/^\//, "")}`}
							label={i18n.translate ("path")}
							variant="filled"
							onChange={e => this.setCookie ({ path: `/${e.target.value.replace (/^\//, "")}` })}
							inputProps={{ name: "path" }}
						/>
					</Grid>
					<Grid item xs={12} md={12} >
						<DateTime
							error={Boolean ( error )}
							disabled={Boolean ( session || isProtected )}
							value={moment.unix ( session ? 0 : expirationDate ).format ("YYYY-MM-DDTHH:mm:ss").substring ( 0, 19 )}
							onChange={value => this.setCookie ({ expirationDate: moment ( value ).unix () })}
						/>
					</Grid>
					<Grid item xs={12} md={12} >
						<StyledTextField
							error={Boolean ( error )}
							disabled={isProtected}
							maxRows={1}
							value={value}
							variant="filled"
							onChange={e => this.setCookie ({ value: e.target.value })}
							label={`${i18n.translate ("value")} (${value.length} ${value.length === 1 ? i18n.translate ("byte") : i18n.translate ("bytes")})`}
							inputProps={{ name: "value" }}
						/>
					</Grid>
					<Grid item xs={12} md={12} >
						<FormControl fullWidth disabled={isProtected} variant="filled" >
							<InputLabel>{i18n.translate ("sameSiteStatus")}</InputLabel>
							<Select
								error={Boolean ( error )}
								fullWidth
								value={sameSite}
								disabled={isProtected}
								variant="filled"
								inputProps={{ name: "sameSite" }}
								onChange={e => this.setCookie ({
									sameSite: e.target.value,
									secure: e.target.value === "no_restriction"
										? true
										: secure
								})} >
								{
									navigator.userAgent.indexOf ("Chrome") >= 0 && <MenuItem value="unspecified" >
										<ListItemIcon><UnspecifiedIcon color={isProtected ? "disabled" : "inherit"} /></ListItemIcon>
										<ListItemText
											classes={{ multiline: classes.listItemText }}
											primary={i18n.translate ("unspecified")}
											secondary={`— ${i18n.translate ("unspecifiedDescription")}`}
											primaryTypographyProps={{
												className: classes.primary,
											}}
											secondaryTypographyProps={{
												className: classes.secondary,
												variant: "body1",
											}}
										/>
									</MenuItem>
								}
								<MenuItem value="no_restriction" >
									<ListItemIcon><NoRestrictionIcon color={isProtected ? "disabled" : "inherit"} /></ListItemIcon>
									<ListItemText
										classes={{ multiline: classes.listItemText }}
										primary={i18n.translate ("noRestriction")}
										secondary={`— ${i18n.translate ("noRestrictionDescription")}`}
										primaryTypographyProps={{
											className: classes.primary,
										}}
										secondaryTypographyProps={{
											className: classes.secondary,
											variant: "body1",
										}}
									/>
								</MenuItem>
								<MenuItem value="lax" >
									<ListItemIcon><LaxIcon color={isProtected ? "disabled" : "inherit"} /></ListItemIcon>
									<ListItemText
										classes={{ multiline: classes.listItemText }}
										primary={i18n.translate ("lax")}
										secondary={`— ${i18n.translate ("laxDescription")}`}
										primaryTypographyProps={{
											className: classes.primary,
										}}
										secondaryTypographyProps={{
											className: classes.secondary,
											variant: "body1",
										}}
									/>
								</MenuItem>
								<MenuItem value="strict" >
									<ListItemIcon><StrictIcon color={isProtected ? "disabled" : "inherit"} /></ListItemIcon>
									<ListItemText
										classes={{ multiline: classes.listItemText }}
										primary={i18n.translate ("strict")}
										secondary={`— ${i18n.translate ("strictDescription")}`}
										primaryTypographyProps={{
											className: classes.primary,
										}}
										secondaryTypographyProps={{
											className: classes.secondary,
											variant: "body1",
										}}
									/>
								</MenuItem>
							</Select>
						</FormControl>
					</Grid>
					<Grid item xs={12} md={12} >
						<ToggleButtonGroup
							size="small"
							value={[
								...( hostOnly ? [ "hostOnly" ] : [] ),
								...( httpOnly ? [ "httpOnly" ] : [] ),
								...( ( secure || name.startsWith ("__Secure") || name.startsWith("__Host") || sameSite === "no_restriction" ) ? [ "secure" ] : [] ),
								...( session ? [ "session" ] : [] ),
								...( isProtected ? [ "isProtected" ] : [] ),
							]}
							onChange={( e, value ) => {
								const newIsProtected = value.includes ("isProtected")
								this.setCookie (
									{
										hostOnly: value.includes ("hostOnly"),
										httpOnly: value.includes ("httpOnly"),
										secure: value.includes ("secure"),
										session: value.includes ("session"),
										expirationDate: value.includes ("session")
											? expirationDate
											: !expirationDate
											? moment ().add ( 1, "year" ).unix ()
											: expirationDate,
									},
									{ isProtected: newIsProtected },
									newIsProtected ? onProtect : onRemoveProtect
								)
							}} >
							<ToggleButton
								classes={{
									root: classes.toggle,
									disabled: classes.toggleDisabled,
									selected: classes.toggleSelected,
								}}
								disabled={isProtected || sameSite === "no_restriction" || name.startsWith ("__Secure") || name.startsWith("__Host")}
								value="secure" >
								{secure || sameSite === "no_restriction" ? <SecureOnIcon/> : <SecureOffIcon/>}
								<span className={classes.toggleLabel} >{i18n.translate ("secure")}</span>
							</ToggleButton>
							<ToggleButton
								classes={{
									root: classes.toggle,
									disabled: classes.toggleDisabled,
									selected: classes.toggleSelected,
								}}
								disabled={isProtected}
								value="httpOnly" >
								{httpOnly ? <HttpOnlyOnIcon/> : <HttpOnlyOffIcon/>}
								<span className={classes.toggleLabel} >{i18n.translate ("httpOnly")}</span>
							</ToggleButton>
							<ToggleButton
								classes={{
									root: classes.toggle,
									disabled: classes.toggleDisabled,
									selected: classes.toggleSelected,
								}}
								disabled={isProtected}
								value="hostOnly" >
								{hostOnly ? <HostOnlyOnIcon/> : <HostOnlyOffIcon/>}
								<span className={classes.toggleLabel} >{i18n.translate ("hostOnly")}</span>
							</ToggleButton>
							<ToggleButton
								classes={{
									root: classes.toggle,
									disabled: classes.toggleDisabled,
									selected: classes.toggleSelected,
								}}
								disabled={isProtected}
								value="session" >
								{session ? <SessionOnIcon/> : <SessionOffIcon/>}
								<span className={classes.toggleLabel} >{i18n.translate ("session")}</span>
							</ToggleButton>
							<ToggleButton
								classes={{
									root: classes.toggle,
									disabled: classes.toggleDisabled,
									selected: classes.toggleSelected,
								}}
								disabled={isNew}
								value="isProtected" >
								{isProtected ? <ProtectOnIcon/> : <ProtectOffIcon/>}
								<span className={classes.toggleLabel} >{i18n.translate ("protect")}</span>
							</ToggleButton>
						</ToggleButtonGroup>
					</Grid>
					<Grid item xs={12} md={12} >
						<Button
							fullWidth
							variant="contained"
							size="large"
							disabled={isProtected || Boolean ( error )}
							onClick={() => this.handleSave ()} >
							{
								error
								? this.getErrorMessage ()
								: isProtected
								? i18n.translate ("protectedCookie")
								: isNew ? i18n.translate ("createCookie")
								: i18n.translate ("updateCookie")
							}
						</Button>
					</Grid>
				</Grid>
			</Paper>
		</Backdrop>
	}

}

CookieViewer.propTypes = {
	classes: PropTypes.object.isRequired,
	storage: PropTypes.object.isRequired,
	cookies: PropTypes.object.isRequired,
	isNew: PropTypes.bool.isRequired,
	cookie: PropTypes.object.isRequired,
	onClose: PropTypes.func.isRequired,
	exportJson: PropTypes.func.isRequired,
	onDownloadJson: PropTypes.func.isRequired,
	exportNetscape: PropTypes.func.isRequired,
	onDownloadNetscape: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
	onBlock: PropTypes.func.isRequired,
	onProtect: PropTypes.func.isRequired,
	onRemoveProtect: PropTypes.func.isRequired,
}

export default withStorage ( withI18n ( withCookies ( withStyles ( styles ) ( CookieViewer ) ) ) )
