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
                if ((routeInfo.name == 'tags.showCategory') || (routeInfo.name == 'tags.showCategoryNone') || (routeInfo.name == 'discovery.category')) {
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
                    ajax(`/tag/${settings.announcements_tag_name}/l/latest.json`).then((result) => {
                        var announcement_topics = result.topic_list.topics.slice(0,3);
                        var topic_ids = announcement_topics.map((topic) => topic.id);
                        var tooltipURL = '/tooltip-previews?fetch';
                        topic_ids.forEach((id) => {
                            tooltipURL = tooltipURL + '&topic_ids[]=' + id;
                        });
                        ajax(tooltipURL).then((ttResult) => {
                            topic_ids.forEach((id) => {
                                // Find the corresponding topic in the topicList by ID
                                const topic = announcement_topics.find((topic) => topic.id === id);

                                // Insert the newField into the topic
                                if (topic && ttResult.excerpts[id]) {
                                    var ex = ttResult.excerpts[id].excerpt;
                                    var nli = ex.indexOf("\n");
                                    topic.excerpt = (nli !== -1) ? ex.substring(0, nli) : ex;
                                }
                            });
                            this.announcement_topics = announcement_topics;
                        });
                    });
                }
            });
        });
    }

    get showComponent() {
        return this.mustShow;
    }
}
