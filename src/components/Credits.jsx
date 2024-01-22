import browser from "webextension-polyfill"
import React from "react"
import PropTypes from "prop-types"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableRow from "@material-ui/core/TableRow"
import TableCell from "@material-ui/core/TableCell"
import TableFooter from "@material-ui/core/TableFooter"
import TablePagination from "@material-ui/core/TablePagination"
import Button from "@material-ui/core/Button"
import SourceIcon from "@material-ui/icons/Github"
import ImageIcon from "@material-ui/icons/Wallpaper"
import TypeIcon from "@material-ui/icons/Title"
import { withStyles } from "@material-ui/core/styles"

const styles = theme => ({
	row: {
		width: 18,
		paddingRight: 0,
	},
	container: {
		width: "100%",
		height: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	icon: {
		fontSize: 18,
	},
})

class Credits extends React.Component {

	renderRow ( icon, name, link ) {
		const { classes } = this.props
		return <TableRow key={name} >
			<TableCell size="small" className={classes.row} >
				<div className={classes.container} >{icon}</div>
			</TableCell>
			<TableCell size="small" >
				{name}
			</TableCell>
			<TableCell size="small" align="right" style={{ width: 64 }} >
				<Button size="small" onClick={() => browser.tabs.create ({ url: link })} >{browser.i18n.getMessage ("link")}</Button>
			</TableCell>
		</TableRow>
	}

	render () {
		const { classes } = this.props
		const makeIcon = Icon => <Icon fontSize="inherit" className={classes.icon} />
		return <Table>
			<TableBody>
			{[
				this.renderRow ( makeIcon ( SourceIcon ), "emotion-js/emotion", "https://github.com/emotion-js/emotion" ),
				this.renderRow ( makeIcon ( SourceIcon ), "bvaughn/react-window", "https://github.com/bvaughn/react-window" ),
				this.renderRow ( makeIcon ( SourceIcon ), "facebook/react", "https://github.com/facebook/react" ),
				this.renderRow ( makeIcon ( SourceIcon ), "lodash/lodash", "https://github.com/lodash/lodash" ),
				this.renderRow ( makeIcon ( SourceIcon ), "moment/moment", "https://github.com/moment/moment" ),
				this.renderRow ( makeIcon ( SourceIcon ), "mozilla/webextension-polyfill", "https://github.com/mozilla/webextension-polyfill" ),
				this.renderRow ( makeIcon ( SourceIcon ), "mui-org/material-ui", "https://github.com/mui-org/material-ui" ),
				this.renderRow ( makeIcon ( SourceIcon ), "parcel-bundler/parcel", "https://github.com/parcel-bundler/parcel" ),
				this.renderRow ( makeIcon ( SourceIcon ), "petkaantonov/bluebird", "https://github.com/petkaantonov/bluebird" ),
				this.renderRow ( makeIcon ( SourceIcon ), "sudodoki/copy-to-clipboard", "https://github.com/sudodoki/copy-to-clipboard" ),
				this.renderRow ( makeIcon ( ImageIcon ), "icon-approximately-equal", "https://materialdesignicons.com/icon/approximately-equal" ),
				this.renderRow ( makeIcon ( ImageIcon ), "icon-crosshairs-question", "https://materialdesignicons.com/icon/crosshairs-question" ),
				this.renderRow ( makeIcon ( ImageIcon ), "icon-equal", "https://materialdesignicons.com/icon/equal" ),
				this.renderRow ( makeIcon ( ImageIcon ), "icon-file-export", "https://materialdesignicons.com/icon/file-export" ),
				this.renderRow ( makeIcon ( ImageIcon ), "icon-file-import", "https://materialdesignicons.com/icon/file-import" ),
				this.renderRow ( makeIcon ( ImageIcon ), "icon-filter-off-outline", "https://materialdesignicons.com/icon/filter-off-outline" ),
				this.renderRow ( makeIcon ( ImageIcon ), "icon-lock-off", "https://materialdesignicons.com/icon/lock-off" ),
				this.renderRow ( makeIcon ( ImageIcon ), "icon-regex", "https://materialdesignicons.com/icon/regex" ),
				this.renderRow ( makeIcon ( ImageIcon ), "icon-shield-off", "https://materialdesignicons.com/icon/shield-off" ),
				this.renderRow ( makeIcon ( TypeIcon ), "font-roboto", "https://fonts.google.com/specimen/Roboto" ),
			]}
			</TableBody>
			<TableFooter>
				<TableRow>
					<TablePagination
						labelRowsPerPage=""
						labelDisplayedRows={({ from, to, count }) => ""}
						backIconButtonProps={{ style: { display: "none" } }}
						nextIconButtonProps={{ style: { display: "none" } }}
						rowsPerPageOptions={[ 1 ]}
						rowsPerPage={1}
						colSpan={3}
						count={0}
						page={0}
						SelectProps={{ style: { display: "none" } }}
						style={{ border: "none" }}
						onPageChange={( event, page ) => {}}
					/>
				</TableRow>
			</TableFooter>
		</Table>
	}

}

Credits.propTypes = {
	classes: PropTypes.object.isRequired,
}

export default withStyles ( styles ) ( Credits )
