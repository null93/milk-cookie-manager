import _ from "lodash"
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

class TableList extends React.Component {

	constructor ( props ) {
		super ( props )
		this.state = {
			page: 0,
			perPage: 15,
		}
	}

	render () {
		const { items, itemKey, onTruncate, noItemsMessage, columns } = this.props
		const { perPage } = this.state
		const rows = Object.values ( items )
			.sort ( ( a, b ) => a.name < b.name ? -1 : 1 )
		const page = Math.min ( Math.max ( 0, Math.ceil ( rows.length / perPage ) - 1 ), this.state.page )
		const columnNames = _.keys ( columns )
		return <Table>
			<TableHead>
				<TableRow>
					{
						columnNames.filter ( e => !!e ).map ( columnName =>
							<TableCell
								style={{ width: "50%" }}
								key={columnName} >
								{columnName}
							</TableCell>
						)
					}
					<TableCell align="right" >
						<Button
							disabled={rows.length < 1}
							size="small"
							onClick={onTruncate} >
							Truncate
						</Button>
					</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
			{
				rows.length < 1 && <TableRow>
					<TableCell colSpan={3} size="small" >
						{noItemsMessage}
					</TableCell>
				</TableRow>
			}
			{
				rows.slice ( page * perPage, page * perPage + perPage ).map (
					row => <TableRow key={itemKey ( row )} >
						{
							columnNames.map ( ( columnName, index ) =>
								<TableCell
									key={columnName}
									size="small"
									style={index === columnNames.length - 1 ? {} : { width: "50%" }}
									align={index === columnNames.length - 1 ? "right" : "left"} >
									{columns [ columnName ] ( row )}
								</TableCell>
							)
						}
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

TableList.propTypes = {
	items: PropTypes.object.isRequired,
	itemKey: PropTypes.func.isRequired,
	onTruncate: PropTypes.func.isRequired,
	noItemsMessage: PropTypes.string.isRequired,
	columns: PropTypes.object.isRequired,
}

export default TableList 
