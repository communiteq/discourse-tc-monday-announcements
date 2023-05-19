import Component from '@glimmer/component';
import { withPluginApi } from "discourse/lib/plugin-api"
import { tracked } from '@glimmer/tracking';
import { ajax } from "discourse/lib/ajax";

export default class MondayAnnoucements extends Component {
    @tracked mustShow = false;
    @tracked announcement_topics = [];

    constructor() {
        super(...arguments);
        withPluginApi("0.3.0", (api) => {
            this.router = api.container.lookup('service:router');
            api.onPageChange((url, title) => {
                var routeInfo = this.router.recognize(url);
                console.log(routeInfo);
                if ((routeInfo.name == 'tags.showCategory') || (routeInfo.name == 'tags.showCategoryNone')
                    || (routeInfo.name == 'discovery.category') || (routeInfo.name == 'discovery.categoryNone')) {
                    var param = routeInfo.params.category_slug_path_with_id || '';
                    if (param.startsWith(settings.announcements_category_slug)) {
                        this.mustShow = true;
                    } else {
                        this.mustShow = false;
                    }
                }
                else {
                    this.mustShow = false;
                }

                if (this.mustShow) {
                    console.log(settings.announcements_topics);
                    this.announcement_topics = JSON.parse(settings.announcements_topics);
                }
            });
        });
    }

    get showComponent() {
        return this.mustShow;
    }
}
