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
		borderBottom: "none !important",
	},
})

class MainMenu extends React.Component {

	constructor ( props ) {
		super ( props )
		this.state = {
			anchor: null,
			dialog: {
				open: false,
				title: "Confirm Action",
				content: <Typography gutterBottom >
					Are you sure you want to proceed?
				</Typography>,
				showCancel: true,
				showSubmit: true,
				cancel: {
					label: "Cancel",
					callback: () => this.handleDialogClose (),
				},
				submit: {
					label: "Submit",
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
				title="Show Available Actions" >
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
						title="Delete Visible Cookies" >
						<MenuItem
							className={classes.item}
							disabled={hits < 1}
							onClick={
								storage.data.showWarnings
								? () => this.setDialogState ({
									open: true,
									content: <Typography gutterBottom >You are about to delete all currently visible cookies. Are you sure you want to proceed?</Typography>,
									showCancel: true,
									showSubmit: true,
									submit: {
										label: `Delete ${hits.toString ().replace ( /\B(?=(\d{3})+(?!\d))/g, "," )} Cookie${hits > 1 ? "s" : ""}`,
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
							<Typography>{`Delete (${hits.toString ().replace ( /\B(?=(\d{3})+(?!\d))/g, "," )} Cookies)`}</Typography>
						</MenuItem>
					</Tooltip>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title="Block Visible Cookies" >
						<MenuItem
							className={classes.item}
							disabled={hits < 1}
							onClick={
								storage.data.showWarnings
								? () => this.setDialogState ({
									open: true,
									content: <Typography gutterBottom >You are about to block and delete all currently visible cookies (protected cookies are skipped). Are you sure you want to proceed?</Typography>,
									showCancel: true,
									showSubmit: true,
									submit: {
										label: `Block ${hits.toString ().replace ( /\B(?=(\d{3})+(?!\d))/g, "," )} Cookie${hits > 1 ? "s" : ""}`,
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
							<Typography>{`Block (${hits.toString ().replace ( /\B(?=(\d{3})+(?!\d))/g, "," )} Cookies)`}</Typography>
						</MenuItem>
					</Tooltip>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title="Protect Visible Cookies" >
						<MenuItem
							className={classes.item}
							disabled={hits < 1}
							onClick={
								storage.data.showWarnings
								? () => this.setDialogState ({
									open: true,
									content: <Typography gutterBottom >You are about to protect all currently visible cookies. Are you sure you want to proceed?</Typography>,
									showCancel: true,
									showSubmit: true,
									submit: {
										label: `Protect ${hits.toString ().replace ( /\B(?=(\d{3})+(?!\d))/g, "," )} Cookie${hits > 1 ? "s" : ""}`,
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
							<Typography>{`Protect (${hits.toString ().replace ( /\B(?=(\d{3})+(?!\d))/g, "," )} Cookies)`}</Typography>
						</MenuItem>
					</Tooltip>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title="Copy CURL Command With Visible Cookies" >
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
							<Typography>Copy <i>CURL</i> Command</Typography>
						</MenuItem>
					</Tooltip>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title="Import Cookies Via JSON File" >
						<MenuItem
							className={classes.item}
							disabled={false}
							onClick={() => this.handleClose ( () => cookies.import (
									({ current, total }) => this.setDialogState ({
										open: true,
										title: "Importing Cookies",
										content: <Typography gutterBottom >{`Currently processed ${current} out of ${total} cookies.`}</Typography>,
										showCancel: false,
										showSubmit: false,
									})
								)
								.then ( results => this.setDialogState ({
									open: true,
									title: "Imported Results",
									content: <Table>
										<TableBody>
											<TableRow>
												<TableCell padding="none" size="small" className={classes.cell} >
													<Typography>Successfully Imported</Typography>
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
													<Typography>Expired Cookies</Typography>
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
													<Typography>Failed To Import</Typography>
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
										label: `close`,
										callback: () => {
											this.handleDialogClose ()
											this.handleClose ()
										},
									},
								}))
								.catch ( error => this.setDialogState ({
									open: true,
									title: "Import Results",
									content: <Typography gutterBottom >Failed to import cookies, please check JSON file and try again.</Typography>,
									showCancel: false,
									showSubmit: true,
									submit: {
										label: `close`,
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
							<Typography>Import Cookies</Typography>
						</MenuItem>
					</Tooltip>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title="Export Visible Cookies To JSON File" >
						<MenuItem
							className={classes.item}
							disabled={hits < 1}
							onClick={() => this.handleClose ( () => cookies.export () )} >
							<ListItemIcon className={classes.icon} >
								<ExportIcon color="primary" />
							</ListItemIcon>
							<Typography>Export Cookies</Typography>
						</MenuItem>
					</Tooltip>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title="Open In New Tab" >
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
							<Typography>Fullscreen</Typography>
						</MenuItem>
					</Tooltip>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title="Show Extension Options" >
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
							<Typography>Options</Typography>
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
