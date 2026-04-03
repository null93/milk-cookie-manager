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
import MenuIcon from "@material-ui/icons/MoreVert"
import ExportIcon from "icons/Export"
import DeleteIcon from "@material-ui/icons/Delete"
import BlockIcon from "@material-ui/icons/Block"
import DuplicateIcon from "@material-ui/icons/ControlPointDuplicate"
import CopyButton from "components/CopyButton"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableRow from "@material-ui/core/TableRow"
import TableCell from "@material-ui/core/TableCell"
import { withStyles } from "@material-ui/core/styles"
import { withCookies } from "contexts/CookiesContext"
import { withI18n } from "contexts/I18nContext"

const styles = theme => ({
	root: {
		marginTop: theme.spacing ( 1 ),
		marginLeft: -5,
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

class CookieMenu extends React.Component {

	constructor ( props ) {
		super ( props )
		this.state = {
			anchor: null,
			dialog: {
				open: false,
				title: "Confirm Action",
				description: "Are you sure you want to proceed?",
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
		const {
			classes,
			isProtected,
			disabled,
			onDelete,
			onBlock,
			exportJson,
			onDownloadJson,
			exportNetscape,
			onDownloadNetscape,
			onDuplicate,
			i18n,
		} = this.props
		const { anchor, dialog } = this.state
		return <React.Fragment>
			<Tooltip
				arrow
				TransitionComponent={Fade}
				placement="bottom"
				title={disabled ? "" : i18n.translate("showAvailableActions")} >
				<IconButton
					size="medium"
					color="primary"
					disabled={disabled}
					onClick={e => this.setState ({ anchor: e.currentTarget })} >
					<MenuIcon/>
				</IconButton>
			</Tooltip>
			<Dialog fullWidth onClose={() => this.handleDialogClose ()} open={dialog.open} >
				<DialogTitle onClose={() => this.handleDialogClose ()} >
					<b>{dialog.title}</b>
				</DialogTitle>
				<DialogContent dividers >
					<Typography gutterBottom >
						{dialog.description}
					</Typography>
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
				className={classes.root}
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
						title={i18n.translate ("deleteTooltip")} >
						<MenuItem
							className={classes.item}
							disabled={isProtected}
							onClick={onDelete} >
							<ListItemIcon className={classes.icon} >
								<DeleteIcon color="primary" />
							</ListItemIcon>
							<Typography>{i18n.translate ("delete")}</Typography>
						</MenuItem>
					</Tooltip>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title={i18n.translate ("duplicateTooltip")} >
						<MenuItem
							className={classes.item}
							disabled={false}
							onClick={onDuplicate} >
							<ListItemIcon className={classes.icon} >
								<DuplicateIcon color="primary" />
							</ListItemIcon>
							<Typography>{i18n.translate ("duplicate")}</Typography>
						</MenuItem>
					</Tooltip>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title={i18n.translate ("exportTooltip")} >
						<MenuItem
							className={classes.item}
							disabled={false}
							onClick={() => {
								this.setDialogState ({
									open: true,
									title: i18n.translate ("exportCookie"),
									description: <Table>
										<TableBody>
											<TableRow>
												<TableCell padding="none" size="small" className={classes.cell} >
													<Typography>{i18n.translate ("jsonFormat")}</Typography>
												</TableCell>
												<TableCell padding="none" size="small" align="right" className={classes.cell} >
													<CopyButton data={exportJson()} />
												</TableCell>
												<TableCell padding="none" size="small" align="right" className={classes.cell} >
													<Button onClick={onDownloadJson} >{i18n.translate ("download")}</Button>
												</TableCell>
											</TableRow>
											<TableRow>
												<TableCell padding="none" size="small" className={classes.cell} >
													<Typography>{i18n.translate ("netscapeFormat")}</Typography>
												</TableCell>
												<TableCell padding="none" size="small" align="right" className={classes.cell} >
													<CopyButton data={exportNetscape ()} />
												</TableCell>
												<TableCell padding="none" size="small" align="right" className={classes.cell} >
													<Button onClick={onDownloadNetscape} >{i18n.translate ("download")}</Button>
												</TableCell>
											</TableRow>
										</TableBody>
									</Table>,
									showCancel: false,
									showSubmit: true,
									submit: {
										label: i18n.translate ("close"),
										callback: () => {
											this.handleDialogClose ()
											this.handleClose ()
										},
									},
								})
							}} >
							<ListItemIcon className={classes.icon} >
								<ExportIcon color="primary" />
							</ListItemIcon>
							<Typography>{i18n.translate ("export")}</Typography>
						</MenuItem>
					</Tooltip>
					<Tooltip
						arrow
						TransitionComponent={Fade}
						placement="left"
						title={i18n.translate ("blockTooltip")} >
						<MenuItem
							className={classes.item}
							disabled={isProtected}
							onClick={() => {
								onDelete ()
								onBlock ()
							}} >
							<ListItemIcon className={classes.icon} >
								<BlockIcon color="primary" />
							</ListItemIcon>
							<Typography>{i18n.translate ("block")}</Typography>
						</MenuItem>
					</Tooltip>
				</div>
			</Menu>
		</React.Fragment>
	}

}

CookieMenu.propTypes = {
	classes: PropTypes.object.isRequired,
	disabled: PropTypes.bool.isRequired,
	isProtected: PropTypes.bool.isRequired,
	onDelete: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	onDuplicate: PropTypes.func.isRequired,
	exportJson: PropTypes.func.isRequired,
	onDownloadJson: PropTypes.func.isRequired,
	exportNetscape: PropTypes.func.isRequired,
	onDownloadNetscape: PropTypes.func.isRequired,
}

export default
withI18n (
	withCookies (
		withStyles ( styles ) ( CookieMenu )
	)
)
