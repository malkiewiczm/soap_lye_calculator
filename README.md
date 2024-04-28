## Information

This is a Javascript-only soap calculator able to be deployed as a
single html file and works fine offline when downloaded locally as no web
requests are made.

Other reasons why I made this over the existing calculators are:

- The calculations update instantly as you edit the recipe.
- The information density is increased.
- Navigating using the tab key works much better.

For a live version of this see: <https://malkiewiczm.github.io/soap/>

For the source code see: <https://github.com/malkiewiczm/soap_lye_calculator>

## Q and A

**Q:** Where are the saponification and fatty acid values derived from?

**A:** They are taken from [www.SoapCalc.net]. Based on what I've seen other
online calculators take them from too but without credit.

**Q:** Why is your definition of "super fat" different than "lye
discount". Aren't they the same thing?

**A:** I took "super fat" to mean "use this percent more fat in the
recipe" and "lye discount" to mean "use this percent less lye in the
recipe". Online most people refer to them as being the same thing,
taking on the latter definition but it made more sense to me this way.

**Q:** Why is there no "water discount" field?

**A:** Water discount doesn't make that much sense to me. If the
intended purpose is to use less water in the recipe, then just enter a
higher lye concetration.

**Q:** Why is there no field for fragrance or additives?

**A:** IDK

**Q:** What units are the weights in?

**A:** The units can be whatever you want to be. Since all the math is
relative the units of weight don't matter as long as they are the
consistent. If you take a recipe that makes 500g of soap and use it to
make 500 lbs of soap all of the numbers are the same.

**Q:** What do the symbols and colors on the bar graph mean?

**A:** The dark triangles show where the different oils in your recipe
lie on the graph. The hashed lines show where the recipe currently
lies. Since the soap recipe is a ratio of oils, the level indicated by
the hashes will always be between the triangles and can be thought of
as your recipe being "pulled" towards the triangles depending on how
much of that oil is present. The background color is lighter where the
recommended amount is from [www.SoapCalc.net] is, but that is just a
general guideline.

[www.SoapCalc.net]: http://www.soapcalc.net/
