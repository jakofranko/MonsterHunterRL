// Tuesday 03/07/17 at 09:37PM - 27 files in 0.38 secs

## TODO (21)
1. js/ai-tasks.js:8          implement logic switches based on entity behavior
2. js/ai-tasks.js:9          account for ranged weapons (need to separate the Attacker
3. js/ai-tasks.js:26         if I'm not mistaken, this enforces a topology 4 and doesn't account for diagnally adjacent
4. js/ai-tasks.js:58         This might cause some entities to freeze...
5. js/ai.js:3                Implement demeanor/behaviors ('ranged', 'agressive', 'cautious' etc.)
6. js/entity-mixins.js:4     Implement functions for scanning for friends/enemies and getting the nearest of them
7. js/entity-mixins.js:302   does this also change the inventory slot?
8. js/entity-mixins.js:650   Add critical mod
9. js/entity-mixins.js:656   Melee with more slots than just hands?
10. js/entity-mixins.js:657  Handle unarmed combat, or meleeing without melee weapons
11. js/entity-mixins.js:704  Add accuracy modifier
12. js/entity-mixins.js:800  Add critical mod
13. js/entity-mixins.js:860  Support variable amount of ammo expendature
14. js/entity-mixins.js:879  Expend ammo somehow? This will generally be monsters using monster weapons, so maybe not
15. js/entity-mixins.js:901  Add accuracy modifier
16. js/entity-mixins.js:948  This should use the existing FOV isntead of re-computing
17. js/entity-mixins.js:974  Add accuracy modifier
18. js/map.js:204            Add additional criteria for spawning entities such as theme/type based on map/z-level
19. js/map.js:380            move this?
20. js/screens.js:131        Have this be based off the selection of a character select screen
21. js/screens.js:241        Ammo picker screen
