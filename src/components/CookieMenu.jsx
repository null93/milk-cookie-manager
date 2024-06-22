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
	}
})

class MainMenu extends React.Component {

	constructor ( props ) {
		super ( props )
		this.state = {
			anchor: null,
			dialog: {
				open: false,
				title: "Confirm Action",
				description: "Are you sure you want to proceed?",
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
			onExport,
			onDuplicate,
			i18n,
		} = this.props
		const { anchor, dialog } = this.state
		return <React.Fragment>
			<Tooltip
				arrow
				TransitionComponent={Fade}
				placement="bottom"
				title={disabled ? "" : "Show Available Actions"} >
				<IconButton
					size="medium"
					color="primary"
					disabled={disabled}
					onClick={e => this.setState ({ anchor: e.currentTarget })} >
					<MenuIcon/>
				</IconButton>
			</Tooltip>
			<Dialog onClose={() => this.handleDialogClose ()} open={dialog.open} >
				<DialogTitle onClose={() => this.handleDialogClose ()} >
					<b>{dialog.title}</b>
				</DialogTitle>
				<DialogContent dividers >
					<Typography gutterBottom >
						{dialog.description}
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button
						autoFocus
						onClick={() => dialog.cancel.callback ()} color="primary" >
						{dialog.cancel.label}
					</Button>
					<Button onClick={() => dialog.submit.callback ()} color="primary" >
						{dialog.submit.label}
					</Button>
				</DialogActions>
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
							onClick={onExport} >
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

MainMenu.propTypes = {
	classes: PropTypes.object.isRequired,
	disabled: PropTypes.bool.isRequired,
	isProtected: PropTypes.bool.isRequired,
	onDelete: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	onExport: PropTypes.func.isRequired,
	onDuplicate: PropTypes.func.isRequired,
}

export default
withI18n (
	withCookies (
		withStyles ( styles ) ( MainMenu )
	)
)
