DATABASE PLAN
=============

+ get('topic/'): view.jade
+ get('topic/id'): view.jad
+ get('topic/add'): add.jade
    - post('topic/add')
    - get('topic/:id'): direction
+ get('topic/:id/edit'): edit.jade
    - post('topic/:id/edit')
    - get('topic/:id'): direction
+ get('topic/:id/delete'): delete.jade
    - post('topic/:id/delete')
    - get('topic/'): direction

