import _ from "lodash"
import browser from "webextension-polyfill"
import React from "react"
import PropTypes from "prop-types"
import Fab from "@material-ui/core/Fab"
import CircularProgress from "@material-ui/core/CircularProgress"
import AddIcon from "@material-ui/icons/Add"
import CookieItem from "components/CookieItem"
import { FixedSizeList } from "react-window"
import { withStyles } from "@material-ui/core/styles"
import { withStorage } from "contexts/StorageContext"
import { withSearch } from "contexts/SearchContext"
import { withCookies } from "contexts/CookiesContext"

const styles = theme => ({
	list: {
		marginTop: 52,
		background: theme.palette.background.paper,
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
	fab: {
		position: "fixed",
		right: theme.spacing ( 2 ),
		bottom: theme.spacing ( 2 ),
	},
})

class Cookies extends React.Component {

	render () {
		const { classes, storage, search, cookies, onCreate, onItemClick } = this.props
		var items = _.sortBy ( cookies.found, o => storage.data.sortType === "expirationDate"
			? o [ storage.data.sortType ]
			: o [ storage.data.sortType ]
				.replace (/^[^0-9a-z]*/i, "")
				.toLowerCase ()
		)
		if ( storage.data.sortDirection === "descending" ) {
			_.reverse ( items )
		}
		return <React.Fragment>
			{
				!cookies.initialized && <div className={classes.none} >
					<CircularProgress disableShrink />
				</div>
			}
			{
				cookies.initialized && items.length <= 0 && <div className={classes.none} >
					{browser.i18n.getMessage ("noCookiesFound")}
				</div>
			}
			{
				cookies.initialized && items.length > 0 && <FixedSizeList
					className={classes.list}
					height={window.innerHeight - 52}
					width="100%"
					overscanCount={2}
					itemSize={85}
					itemData={items}
					itemCount={items.length} >
					{
						({ index, style, data }) => {
							const cookie = data [ index ]
							const hash = cookies.hash ( cookie )
							return <CookieItem
								hash={hash}
								highlight={search.highlight}
								cookie={cookie}
								style={style}
								isProtected={hash in storage.data.protect}
								expirationFormat={storage.data.expirationFormat}
								onExpire={() => cookies.load ()}
								onItemClick={onItemClick}
							/>
						}
					}
				</FixedSizeList>
			}
			<Fab
				color="primary"
				size="medium"
				id="create-new"
				className={classes.fab}
				onClick={onCreate} >
				<AddIcon/>
			</Fab>
		</React.Fragment>
	}

}

Cookies.propTypes = {
	classes: PropTypes.object.isRequired,
	storage: PropTypes.object.isRequired,
	search: PropTypes.object.isRequired,
	cookies: PropTypes.object.isRequired,
	onItemClick: PropTypes.func.isRequired,
	onCreate: PropTypes.func.isRequired,
}

export default
withStorage (
	withSearch (
		withCookies (
			withStyles ( styles ) ( Cookies )
		)
	)
)
