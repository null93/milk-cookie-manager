import _ from "lodash"
import moment from "moment"
import React from "react"
import PropTypes from "prop-types"
import OmniBar from "components/OmniBar"
import Cookies from "components/Cookies"
import CookieViewer from "components/CookieViewer"
import { withFocus } from "contexts/FocusContext"
import { withStorage } from "contexts/StorageContext"
import { withCookies } from "contexts/CookiesContext"
import { withStyles } from "@material-ui/core/styles"
import { withI18n } from "contexts/I18nContext"

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

	componentDidMount () {
		const { i18n } = this.props
		document.title = i18n.translate ("extensionFullName")
	}

	selectCookie ( cookie ) {
		this.setState ({ cookie, isNew: false })
	}

	selectNewCookie ( cookie ) {
		const { focus } = this.props
		this.setState ({
			isNew: true,
			cookie: {
				domain: focus.domain ? `.${focus.domain}` : ".",
				expirationDate: moment ().add ( 1, "year" ).unix (),
				hostOnly: false,
				httpOnly: true,
				name: "",
				path: focus.path ? focus.path : "/",
				sameSite: "lax",
				secure: focus.last ? focus.last.startsWith ("https") : true,
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
		const { cookies, storage } = this.props
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
					onExport={() => cookies.export ( cookie )}
					onDelete={() => this.unSelectCookie ( () => cookies.delete ( cookie ) )}
					onBlock={() => this.unSelectCookie ( () => {
						storage.add ( "block", cookies.hash ( cookie ), cookie )
						cookies.delete ( cookie )
					})}
					onProtect={() => storage.add ( "protect", cookies.hash ( cookie ), cookie )}
					onRemoveProtect={() => storage.remove ( "protect", cookies.hash ( cookie ) )}
				/>
			}
		</div>
	}

}

Application.propTypes = {
	classes: PropTypes.object.isRequired,
	storage: PropTypes.object.isRequired,
	focus: PropTypes.object.isRequired,
	cookies: PropTypes.object.isRequired,
}

export default
withStorage (
	withI18n (
		withCookies (
			withFocus (
				withCookies (
					withStyles ( styles ) ( Application )
				)
			)
		)
	)
)