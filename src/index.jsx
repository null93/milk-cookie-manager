import "typeface-roboto"
import defaults from "data/defaults"
import theme from "source/theme"
import React from "react"
import ReactDOM from "react-dom"
import Application from "components/Application"
import CssBaseline from "@material-ui/core/CssBaseline"
import { MuiThemeProvider } from "@material-ui/core/styles"
import { CookiesProvider, CookiesConsumer } from "contexts/CookiesContext"
import { FocusProvider, FocusConsumer } from "contexts/FocusContext"
import { SearchProvider, SearchConsumer } from "contexts/SearchContext"
import { StorageProvider, StorageConsumer } from "contexts/StorageContext"

ReactDOM.render (
	<StorageProvider
		defaults={defaults} >
		<FocusProvider>
			<FocusConsumer>
			{
				focus => <StorageConsumer>
				{
					storage => <SearchProvider
						focus={focus}
						storage={storage} >
						<SearchConsumer>
						{
							search => <CookiesProvider
								focus={focus}
								storage={storage}
								search={search} >
								<MuiThemeProvider
									theme={theme ( storage.data.dark )} >
									<CssBaseline/>
									<Application/>
								</MuiThemeProvider>
							</CookiesProvider>
						}
						</SearchConsumer>
					</SearchProvider>
				}
				</StorageConsumer>
			}
			</FocusConsumer>
		</FocusProvider>
	</StorageProvider>,
	document.getElementById ("main"),
)
