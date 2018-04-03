


### Collateral Manager

* The webpack config uses a vendor bundle strategy that utilizes a manifest layer for indirection, which makes it very efficient & cheap when custom code (non vendor) is modified (read: vendor TS/CSS is not re-computed and output on every code modification)

