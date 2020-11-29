import _ from "lodash"
import moment from "moment"
import React from "react"
import PropTypes from "prop-types"
import OmniBar from "components/OmniBar"
import Cookies from "components/Cookies"
import CookieViewer from "components/CookieViewer"
import { withChrome } from "contexts/ChromeContext"
import { withStyles } from "@material-ui/core/styles"

const styles = theme => ({
	root: {
		background: theme.palette.background.default,
	},
})

class Application extends React.Component {

	constructor ( props ) {
		super ( props )
		this.state = {
			cookie: null,
			isNew: false,
		}
	}

	selectCookie ( cookie ) {
		this.setState ({ cookie, isNew: false })
	}

	selectNewCookie ( cookie ) {
		const { data } = this.props
		const domain = data.activeUrl ? _.get ( new URL ( data.activeUrl ), "hostname", "" ) : ""
		this.setState ({
			isNew: true,
			cookie: {
				domain: domain,
				expirationDate: moment ().add ( 1, "year" ).unix (),
				hostOnly: false,
				httpOnly: true,
				name: "",
				path: "/",
				sameSite: "unspecified",
				secure: true,
				session: false,
				storeId: "0",
				value: "",
			}
		})
	}

	unSelectCookie ( callback ) {
		this.setState ( { cookie: null }, callback )
	}

	render () {
		const { data } = this.props
		const { cookie, isNew } = this.state
		return <div>
			<OmniBar/>
			<Cookies
				onItemClick={cookie => this.selectCookie ( cookie )}
				onCreate={() => this.selectNewCookie ()}
			/>
			{
				cookie && <CookieViewer
					cookie={cookie}
					isNew={isNew}
					onClose={() => this.unSelectCookie ()}
					onExport={() => data.export ( cookie )}
					onDelete={() => this.unSelectCookie ( () => data.delete ( cookie ) )}
					onBlock={() => this.unSelectCookie ( () => {
						data.addBlock ( cookie )
						data.delete ( cookie )
					})}
					onProtect={() => data.addProtect ( cookie )}
					onRemoveProtect={() => data.removeProtect ( cookie )}
				/>
			}
		</div>
	}

}

Application.propTypes = {
	classes: PropTypes.object.isRequired,
	data: PropTypes.object.isRequired,
}

export default withChrome ( withStyles ( styles ) ( Application ) )
