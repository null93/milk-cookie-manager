import browser from "webextension-polyfill"
import copy from "copy-to-clipboard"
import React from "react"
import PropTypes from "prop-types"
import IconButton from "@material-ui/core/IconButton"
import Menu from "@material-ui/core/Menu"
import Fade from "@material-ui/core/Fade"
import Tooltip from "components/Tooltip"
import MenuItem from "@material-ui/core/MenuItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import Typography from "@material-ui/core/Typography"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogContent from "@material-ui/core/DialogContent"
import DialogActions from "@material-ui/core/DialogActions"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableRow from "@material-ui/core/TableRow"
import TableCell from "@material-ui/core/TableCell"
import CopyButton from "components/CopyButton"
import MenuIcon from "@material-ui/icons/MoreVert"
import ImportIcon from "icons/Import"
import ExportIcon from "icons/Export"
import DeleteIcon from "@material-ui/icons/Delete"
import BlockIcon from "@material-ui/icons/Block"
import ProtectIcon from "@material-ui/icons/Security"
import SettingsIcon from "@material-ui/icons/Settings"
import FullscreenIcon from "@material-ui/icons/Fullscreen"
import TerminalIcon from "@material-ui/icons/Code"
import { withStyles } from "@material-ui/core/styles"
import { withFocus } from "contexts/FocusContext"
import { withSearch } from "contexts/SearchContext"
import { withStorage } from "contexts/StorageContext"
import { withCookies } from "contexts/CookiesContext"

const styles = theme => ({
	button: {
		padding: 6,
	},
	item: {
		minHeight: 40,
	},
	icon: {
		minWidth: 34,
	},
	cell: {
		borderBottom: "solid 1px transparent !important",
	},
})

class MainMenu extends React.Component {

	constructor ( props ) {
		super ( props )
		this.state = {
			anchor: null,
			dialog: {
				open: false,
				title: browser.i18n.getMessage ("confirmAction"),
				content: <Typography gutterBottom >
					{browser.i18n.getMessage ("areYouSureYouWantToProceed")}
				</Typography>,
				showCancel: true,
				showSubmit: true,
				cancel: {
					label: browser.i18n.getMessage ("cancel"),
					callback: () => this.handleDialogClose (),
				},
				submit: {
					label: browser.i18n.getMessage ("submit"),
					callback: () => {},
				},
			},
		}
	}

	handleClose ( callback = () => {} ) {
		this.setState ( { anchor: null }, callback )
	}

	setDialogState ( options, callback = () => {} ) {
		this.setState ( state => ({
			dialog: {
				...state.dialog,
				...options,
			},
		}), callback )
	}

	handleDialogClose () {
		this.setDialogState ({ open: false })
	}

	render () {
		const { classes, search, storage, focus, cookies } = this.props
		const { anchor, dialog } = this.state
		const hits = cookies.found.length
		return <React.Fragment>
			<Tooltip
				arrow
				TransitionComponent={Fade}
				placement="bottom"
				title={browser.i18n.getMessage ("menuTooltip")} >
				<IconButton
					size="small"
					color="primary"
					className={classes.button}
					onClick={e => this.setState ({ anchor: e.currentTarget })} >
					<MenuIcon/>
				</IconButton>
			</Tooltip>
			<Dialog fullWidth open={dialog.open} onClose={() => {}} >
				<DialogTitle onClose={() => this.handleDialogClose ()} >
					<b>{dialog.title}</b>
				</DialogTitle>
				<DialogContent dividers >
					{dialog.content}
				</DialogContent>
				{
					( dialog.showCancel || dialog.showSubmit ) && <DialogActions>
						{
							dialog.showCancel && <Button
								autoFocus={!dialog.showSubmit}
								color="primary"
								onClick={() => dialog.cancel.callback ()} >
								{dialog.cancel.label}
							</Button>
						}
						{
							dialog.showSubmit && <Button
								autoFocus={!dialog.showCancel}
								onClick={() => dialog.submit.callback ()}
								color="primary" >
								{dialog.submit.label}
							</Button>
						}
					</DialogActions>
				}
			</Dialog>
			<Menu
				classes={{ list: classes.list }}
				anchorEl={anchor}
				open={Boolean ( anchor )}
				onClose={() => this.handleClose ()}
				TransitionComponent={Fade} >
				<div>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title={browser.i18n.getMessage ("deleteVisibleCookiesTooltip")} >  
						<MenuItem
							className={classes.item}
							disabled={hits < 1}
							onClick={
								storage.data.showWarnings
								? () => this.setDialogState ({
									open: true,
									content: <Typography gutterBottom >{browser.i18n.getMessage ("deleteVisibleCookiesConfirmation")}</Typography>,
									showCancel: true,
									showSubmit: true,
									submit: {
										label: `${browser.i18n.getMessage ("delete")} ${hits.toString ().replace ( /\B(?=(\d{3})+(?!\d))/g, "," )} ${hits > 1 ? browser.i18n.getMessage ("cookies") : browser.i18n.getMessage ("cookie")}`,
										callback: () => {
											cookies.delete ()
											this.handleDialogClose ()
											this.handleClose ()
										},
									},
								})
								: () => {
									cookies.delete ()
									this.handleDialogClose ()
									this.handleClose ()
								}
							} >
							<ListItemIcon className={classes.icon} >
								<DeleteIcon color="primary" />
							</ListItemIcon>
							<Typography>{`${browser.i18n.getMessage ("delete")} (${hits.toString ().replace ( /\B(?=(\d{3})+(?!\d))/g, "," )} ${browser.i18n.getMessage ("cookies")})`}</Typography>
						</MenuItem>
					</Tooltip>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title={browser.i18n.getMessage ("blockVisibleCookiesTooltip")} >
						<MenuItem
							className={classes.item}
							disabled={hits < 1}
							onClick={
								storage.data.showWarnings
								? () => this.setDialogState ({
									open: true,
									content: <Typography gutterBottom >{browser.i18n.getMessage ("blockVisibleCookiesConfirmation")}</Typography>,
									showCancel: true,
									showSubmit: true,
									submit: {
										label: `${browser.i18n.getMessage ("block")} ${hits.toString ().replace ( /\B(?=(\d{3})+(?!\d))/g, "," )} ${hits > 1 ? browser.i18n.getMessage ("cookies") : browser.i18n.getMessage ("cookie")}`,
										callback: () => {
											cookies.block ()
											this.handleDialogClose ()
											this.handleClose ()
										},
									},
								})
								: () => {
									cookies.block ()
									this.handleDialogClose ()
									this.handleClose ()
								}
							} >
							<ListItemIcon className={classes.icon} >
								<BlockIcon color="primary" />
							</ListItemIcon>
							<Typography>{`${browser.i18n.getMessage ("block")} (${hits.toString ().replace ( /\B(?=(\d{3})+(?!\d))/g, "," )} ${browser.i18n.getMessage ("cookies")})`}</Typography>
						</MenuItem>
					</Tooltip>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title={browser.i18n.getMessage ("protectVisibleCookiesTooltip")} >
						<MenuItem
							className={classes.item}
							disabled={hits < 1}
							onClick={
								storage.data.showWarnings
								? () => this.setDialogState ({
									open: true,
									content: <Typography gutterBottom >{browser.i18n.getMessage ("protectVisibleCookiesConfirmation")}</Typography>,
									showCancel: true,
									showSubmit: true,
									submit: {
										label: `${browser.i18n.getMessage ("protect")} ${hits.toString ().replace ( /\B(?=(\d{3})+(?!\d))/g, "," )} ${hits > 1 ? browser.i18n.getMessage ("cookies") : browser.i18n.getMessage ("cookie")}`,
										callback: () => {
											cookies.protect ()
											this.handleDialogClose ()
											this.handleClose ()
										},
									},
								})
								: () => {
									cookies.protect ()
									this.handleDialogClose ()
									this.handleClose ()
								}
							} >
							<ListItemIcon className={classes.icon} >
								<ProtectIcon color="primary" />
							</ListItemIcon>
							<Typography>{`${browser.i18n.getMessage ("protect")} (${hits.toString ().replace ( /\B(?=(\d{3})+(?!\d))/g, "," )} ${browser.i18n.getMessage ("cookies")})`}</Typography>
						</MenuItem>
					</Tooltip>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title={browser.i18n.getMessage ("copyCurlTooltip")} >
						<MenuItem
							className={classes.item}
							disabled={hits < 1 || !focus.last || !search.filtered}
							onClick={() => {
								copy ( cookies.curl () )
								this.handleClose ()
							}} >
							<ListItemIcon className={classes.icon} >
								<TerminalIcon color="primary" />
							</ListItemIcon>
							<Typography>{browser.i18n.getMessage ("copyCurlCommand")}</Typography>
						</MenuItem>
					</Tooltip>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title={browser.i18n.getMessage ("importCookiesViaJsonTooltip")} >
						<MenuItem
							className={classes.item}
							disabled={false}
							onClick={() => this.handleClose ( () => cookies.import (
									({ current, total }) => this.setDialogState ({
										open: true,
										title: browser.i18n.getMessage ("importingCookies"),
										content: <Typography gutterBottom >
											{
												browser.i18n.getMessage ("currentlyProcessesTemplateString")
													.replace("{{current}}", current)
													.replace("{{total}}", total)
											}
										</Typography>,
										showCancel: false,
										showSubmit: false,
									})
								)
								.then ( results => this.setDialogState ({
									open: true,
									title: browser.i18n.getMessage ("importedResults"),
									content: <Table>
										<TableBody>
											<TableRow>
												<TableCell padding="none" size="small" className={classes.cell} >
													<Typography>{browser.i18n.getMessage ("successfullyImported")}</Typography>
												</TableCell>
												<TableCell padding="none" size="small" className={classes.cell} >
													<Typography>{results.success.length}</Typography>
												</TableCell>
												<TableCell padding="none" size="small" align="right" className={classes.cell} >
													<CopyButton
														disabled={results.success.length < 1}
														data={JSON.stringify ( results.success, null, "\t" )}
													/>
												</TableCell>
											</TableRow>
											<TableRow>
												<TableCell padding="none" size="small" className={classes.cell} >
													<Typography>{browser.i18n.getMessage ("expiredCookies")}</Typography>
												</TableCell>
												<TableCell padding="none" size="small" className={classes.cell} >
													<Typography>{results.expired.length}</Typography>
												</TableCell>
												<TableCell padding="none" size="small" align="right" className={classes.cell} >
													<CopyButton
														disabled={results.expired.length < 1}
														data={JSON.stringify ( results.expired, null, "\t" )}
													/>
												</TableCell>
											</TableRow>
											<TableRow>
												<TableCell padding="none" size="small" className={classes.cell} >
													<Typography>{browser.i18n.getMessage ("failedImported")}</Typography>
												</TableCell>
												<TableCell padding="none" size="small" className={classes.cell} >
													<Typography>{results.failed.length}</Typography>
												</TableCell>
												<TableCell padding="none" size="small" align="right" className={classes.cell} >
													<CopyButton
														disabled={results.failed.length < 1}
														data={JSON.stringify ( results.failed, null, "\t" )}
													/>
												</TableCell>
											</TableRow>
										</TableBody>
									</Table>,
									showCancel: false,
									showSubmit: true,
									submit: {
										label: browser.i18n.getMessage ("close"),
										callback: () => {
											this.handleDialogClose ()
											this.handleClose ()
										},
									},
								}))
								.catch ( error => this.setDialogState ({
									open: true,
									title: browser.i18n.getMessage ("importedResults"),
									content: <Typography gutterBottom >{browser.i18n.getMessage ("failedImportMessage")}</Typography>,
									showCancel: false,
									showSubmit: true,
									submit: {
										label: browser.i18n.getMessage ("close"),
										callback: () => {
											this.handleDialogClose ()
											this.handleClose ()
										},
									},
								}))
							)} >
							<ListItemIcon className={classes.icon} >
								<ImportIcon color="primary" />
							</ListItemIcon>
							<Typography>{browser.i18n.getMessage ("importCookies")}</Typography>
						</MenuItem>
					</Tooltip>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title={browser.i18n.getMessage ("exportToJsonTooltip")} >
						<MenuItem
							className={classes.item}
							disabled={hits < 1}
							onClick={() => this.handleClose ( () => cookies.export () )} >
							<ListItemIcon className={classes.icon} >
								<ExportIcon color="primary" />
							</ListItemIcon>
							<Typography>{browser.i18n.getMessage ("exportCookies")}</Typography>
						</MenuItem>
					</Tooltip>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title={browser.i18n.getMessage ("fullscreenTooltip")} >
						<MenuItem
							className={classes.item}
							disabled={false}
							onClick={() => {
								this.handleClose ()
								browser.tabs.create ({ url: "/index.html" })
							}} >
							<ListItemIcon className={classes.icon} >
								<FullscreenIcon color="primary" />
							</ListItemIcon>
							<Typography>{browser.i18n.getMessage ("fullscreen")}</Typography>
						</MenuItem>
					</Tooltip>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title={browser.i18n.getMessage ("optionsTooltip")} >
						<MenuItem
							className={classes.item}
							disabled={false}
							onClick={() => {
								this.handleClose ()
								browser.runtime.openOptionsPage ()
							}} >
							<ListItemIcon className={classes.icon} >
								<SettingsIcon color="primary" />
							</ListItemIcon>
							<Typography>{browser.i18n.getMessage ("options")}</Typography>
						</MenuItem>
					</Tooltip>
				</div>
			</Menu>
		</React.Fragment>
	}

}

MainMenu.propTypes = {
	classes: PropTypes.object.isRequired,
	storage: PropTypes.object.isRequired,
	focus: PropTypes.object.isRequired,
	search: PropTypes.object.isRequired,
	cookies: PropTypes.object.isRequired,
}

export default
withStorage (
	withSearch (
		withFocus (
			withCookies (
				withStyles ( styles ) ( MainMenu )
			)
		)
	)
)
