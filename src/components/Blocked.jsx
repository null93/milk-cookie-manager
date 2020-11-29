import React from "react"
import PropTypes from "prop-types"
import Table from "@material-ui/core/Table"
import TableHead from "@material-ui/core/TableHead"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableFooter from "@material-ui/core/TableFooter"
import TablePagination from "@material-ui/core/TablePagination"
import TableRow from "@material-ui/core/TableRow"
import Button from "@material-ui/core/Button"
import { withChrome } from "contexts/ChromeContext"

class Blocked extends React.Component {

	constructor ( props ) {
		super ( props )
		this.state = {
			page: 0,
			perPage: 15,
		}
	}

	render () {
		const { data } = this.props
		const { perPage } = this.state
		const rows = Object.values ( data.list.block )
			.sort ( ( a, b ) => a.name < b.name ? -1 : 1 )
		const page = Math.min ( Math.max ( 0, Math.ceil ( rows.length / perPage ) - 1 ), this.state.page )
		return <Table>
			<TableHead>
				<TableRow>
					<TableCell style={{ width: "50%" }} >Name</TableCell>
					<TableCell style={{ width: "50%" }} >Domain + Path</TableCell>
					<TableCell style={{ width: 64 }} >
						<Button size="small" onClick={() => data.clearBlock ()} >Truncate</Button>
					</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
			{
				rows.length < 1 && <TableRow>
					<TableCell colSpan={3} size="small" >
						No Blocked Cookies
					</TableCell>
				</TableRow>
			}
			{
				rows.slice ( page * perPage, page * perPage + perPage ).map (
					row => <TableRow key={`<${row.name}><${row.domain}><${row.path}>`} >
						<TableCell size="small" style={{ width: "50%" }} >{row.name}</TableCell>
						<TableCell size="small" style={{ width: "50%" }} >{row.domain + row.path}</TableCell>
						<TableCell size="small" align="right" style={{ width: 64 }} >
							<Button size="small" onClick={() => data.removeBlock ( row )} >unblock</Button>
						</TableCell>
					</TableRow>
				)
			}
			</TableBody>
			<TableFooter>
				<TableRow>
					<TablePagination
						labelRowsPerPage=""
						labelDisplayedRows={({ from, to, count }) => rows.length > perPage ? `${from}-${to} of ${count}` : ""}
						backIconButtonProps={rows.length > perPage ? {} : { style: { display: "none" } }}
						nextIconButtonProps={rows.length > perPage ? {} : { style: { display: "none" } }}
						rowsPerPageOptions={[ perPage ]}
						rowsPerPage={perPage}
						colSpan={3}
						count={rows.length}
						page={page}
						SelectProps={{ style: { display: "none" } }}
						style={{ border: "none" }}
						onPageChange={( event, page ) => this.setState ({ page })}
					/>
				</TableRow>
			</TableFooter>
		</Table>
	}

}

Blocked.propTypes = {
	data: PropTypes.object.isRequired,
}

export default withChrome ( Blocked )
